import { defineQuery } from 'groq';
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { sanityClient } from 'sanity:client';

const { projectId, dataset } = sanityClient.config();
const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * Build an optimized Sanity CDN URL for an image source returned by the
 * queries below. Applies stored hotspot/crop data when present.
 * @example urlFor(bike.image).width(900).height(700).fit('crop').url()
 */
export const urlFor = (source: SanityImageSource) => builder.image(source);

interface InspectionCheckRecord {
	key: string;
	title: string;
	criteria: string[];
}

interface InspectionScoreRecord {
	points: number;
	notes?: string;
	area: InspectionCheckRecord | null;
}

interface SanityBicycleRecord {
	slug: string;
	name: string;
	year: number;
	category: string;
	condition: string;
	price: number;
	distance: string;
	specification: string;
	image: SanityImageSource;
	alt: string;
	gallery: SanityImageSource[];
	frame: string;
	groupset: string;
	wheels: string;
	size: string;
	description: string;
	inspectionScores: InspectionScoreRecord[];
}

export interface Bicycle extends SanityBicycleRecord {
	checks: Array<{
		key: string;
		name: string;
		max: number;
		score: number;
		notes?: string;
		criteria: string[];
	}>;
	score: number;
	priceLabel: string;
}

interface InspectionStandardRecord {
	areas: Array<{ maxPoints: number; area: InspectionCheckRecord | null }>;
}

const AVAILABLE_BICYCLES_QUERY = defineQuery(`
	*[_type == "bicycle" && available == true] | order(name asc) {
		"slug": slug,
		name,
		year,
		category,
		condition,
		price,
		distance,
		specification,
		image { asset, hotspot, crop },
		alt,
		gallery[]{ asset, hotspot, crop },
		frame,
		groupset,
		wheels,
		size,
		description,
		inspectionScores[]{
			points,
			notes,
			"area": area->{key, title, maxPoints, criteria}
		}
	}
`);

const INSPECTION_AREAS_QUERY = defineQuery(`
	*[_type == "inspectionStandard" && _id == "inspectionStandard"][0]{
		areas[]{
			maxPoints,
			"area": area->{key, title, criteria}
		}
	}
`);

const formatPrice = (price: number) =>
	new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
		maximumFractionDigits: 0,
	}).format(price);

export async function getAvailableBicycles(): Promise<Bicycle[]> {
	const [records, standard] = await Promise.all([
		sanityClient.fetch<SanityBicycleRecord[]>(AVAILABLE_BICYCLES_QUERY),
		sanityClient.fetch<InspectionStandardRecord | null>(INSPECTION_AREAS_QUERY),
	]);
	const areaOrder = new Map(
		(standard?.areas ?? []).map((weightedArea, index) => [weightedArea.area?.key ?? '', index]),
	);
	const areaMaxima = new Map(
		(standard?.areas ?? []).map((weightedArea) => [weightedArea.area?.key ?? '', weightedArea.maxPoints]),
	);

	return records.map((bike) => {
		const checks = bike.inspectionScores
			.map((entry) => ({
				key: entry.area?.key,
				name: entry.area?.title ?? 'Inspection area',
				max: areaMaxima.get(entry.area?.key ?? '') ?? 0,
				score: entry.points,
				notes: entry.notes,
				criteria: entry.area?.criteria ?? [],
			}))
			.sort((left, right) => (areaOrder.get(left.key) ?? 999) - (areaOrder.get(right.key) ?? 999));

		return {
			...bike,
			checks,
			score: checks.reduce((total, check) => total + check.score, 0),
			priceLabel: formatPrice(bike.price),
		};
	});
}