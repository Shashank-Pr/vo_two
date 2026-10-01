import bicycleRecords from './bicycles.json';

export const inspectionAreas = [
	{ name: 'Frame & fork', max: 25 },
	{ name: 'Wheels & tyres', max: 20 },
	{ name: 'Drivetrain', max: 20 },
	{ name: 'Braking', max: 15 },
	{ name: 'Cockpit & fit', max: 10 },
	{ name: 'Ride test & records', max: 10 },
];

export const bicycles = bicycleRecords.map((bike) => ({
	...bike,
	checks: inspectionAreas.map((area, index) => ({ ...area, score: bike.points[index] })),
	score: bike.points.reduce((total, points) => total + points, 0),
}));

export const imageUrl = (image: string, width = 900) =>
	`https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=85`;