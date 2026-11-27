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

interface SpecItemRecord {
	label: string;
	value: string;
}

interface SanityBicycleRecord {
	slug: string;
	name: string;
	year: number;
	/** Original/new-bike price, shown struck through beside our price. */
	newBikePrice?: number;
	price: number;
	image: SanityImageSource;
	alt: string;
	available: boolean;
	/** May be absent on older documents; treated as rentable when missing. */
	isRentable?: boolean;
	gallery: SanityImageSource[];
	/** Every listed spec (size, weight, components…); absent on older documents. */
	specList?: SpecItemRecord[];
	description: string;
	inspectionScores: InspectionScoreRecord[];
}

export interface Bicycle extends SanityBicycleRecord {
	isRentable: boolean;
	checks: Array<{
		key: string;
		name: string;
		max: number;
		score: number;
		notes?: string;
		criteria: string[];
	}>;
	score: number;
	newBikePriceLabel?: string;
	priceLabel: string;
}

interface InspectionStandardRecord {
	areas: Array<{ maxPoints: number; area: InspectionCheckRecord | null }>;
}

const BICYCLES_QUERY = defineQuery(`
	*[_type == "bicycle"] | order(name asc) {
		"slug": slug,
		name,
		year,
		newBikePrice,
		price,
		image { asset, hotspot, crop },
		alt,
		available,
		isRentable,
		gallery[]{ asset, hotspot, crop },
		specList[]{ label, value },
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

/**
 * Embed a Sanity image as a data URL so canvas-generated share graphics can use it.
 * Sanity rejects cross-origin image requests (and therefore tainted canvases), so
 * the image is fetched at build time instead of in the browser.
 */
export async function imageDataUrl(url: string): Promise<string> {
	try {
		const response = await fetch(url);
		if (!response.ok) return '';
		const bytes = new Uint8Array(await response.arrayBuffer());
		let binary = '';
		for (let index = 0; index < bytes.length; index += 0x8000) {
			binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
		}
		const mime = response.headers.get('content-type') || 'image/webp';
		return `data:${mime};base64,${btoa(binary)}`;
	} catch {
		return '';
	}
}

/** The compact spec set used on social share graphics. */
export function shortSpecs(bike: Bicycle, limit = 4) {
	const preferred = ['Frame', 'Size', 'Fork', 'Groupset', 'Brakes', 'Wheels'];
	const specs = bike.specList ?? [];
	const picked = preferred
		.map((label) => specs.find((spec) => spec.label.trim().toLowerCase() === label.toLowerCase()))
		.filter((spec): spec is SpecItemRecord => Boolean(spec));
	return (picked.length ? picked : specs.slice(0, limit)).slice(0, limit);
}

export async function getBicycles(): Promise<Bicycle[]> {
	const [records, standard] = await Promise.all([
		sanityClient.fetch<SanityBicycleRecord[]>(BICYCLES_QUERY),
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
			isRentable: bike.isRentable ?? true,
			checks,
			score: checks.reduce((total, check) => total + check.score, 0),
			newBikePriceLabel: bike.newBikePrice == null ? undefined : formatPrice(bike.newBikePrice),
			priceLabel: formatPrice(bike.price),
		};
	});
}