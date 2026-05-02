/**
 * Preview-only page for screenshotting the Building Comfort screen without
 * authentication. Two variants are exposed:
 *   /preview/comfort/b28  — Building 28 mock dataset
 *   /preview/comfort/hhs  — Haagse Hogeschool mock dataset
 *
 * Mocked data is deterministic and intended only for figure generation.
 */
import { useParams } from 'react-router-dom';
import type { BuildingComfortData } from '../types';
import { RelatednessView } from './occupant/Comfort';

const NOW = new Date(Date.now() - 4 * 60 * 1000).toISOString();

const B28: BuildingComfortData = {
  buildingId: 'b28',
  buildingName: 'Building 28',
  overallScore: 7.4,
  totalVotes: 32,
  computedAt: NOW,
  locations: [
    { floor: '3', floorLabel: 'Floor 3', room: 'E07', roomLabel: 'Room 3.E.07', comfortScore: 7.6, voteCount: 9, breakdown: {} },
    { floor: '3', floorLabel: 'Floor 3', room: 'W12', roomLabel: 'Room 3.W.12', comfortScore: 6.8, voteCount: 5, breakdown: {} },
    { floor: '2', floorLabel: 'Floor 2', room: 'E04', roomLabel: 'Room 2.E.04', comfortScore: 6.2, voteCount: 6, breakdown: {} },
    { floor: '4', floorLabel: 'Floor 4', room: 'E11', roomLabel: 'Room 4.E.11', comfortScore: 8.1, voteCount: 7, breakdown: {} },
    { floor: '5', floorLabel: 'Floor 5', room: 'W02', roomLabel: 'Room 5.W.02', comfortScore: 5.4, voteCount: 5, breakdown: {} },
  ],
};

const HHS: BuildingComfortData = {
  buildingId: 'hhs',
  buildingName: 'Haagse Hogeschool',
  overallScore: 6.9,
  totalVotes: 21,
  computedAt: NOW,
  locations: [
    { floor: '0', floorLabel: 'Open-plan office', room: 's14', roomLabel: 'Strip 0.14', comfortScore: 7.1, voteCount: 6, breakdown: {} },
    { floor: '0', floorLabel: 'Open-plan office', room: 's07', roomLabel: 'Strip 0.07', comfortScore: 6.4, voteCount: 5, breakdown: {} },
    { floor: '0', floorLabel: 'Open-plan office', room: 's22', roomLabel: 'Strip 0.22', comfortScore: 7.8, voteCount: 4, breakdown: {} },
    { floor: '0', floorLabel: 'Open-plan office', room: 's03', roomLabel: 'Strip 0.03', comfortScore: 5.6, voteCount: 6, breakdown: {} },
  ],
};

export default function PreviewComfort() {
  const { variant } = useParams<{ variant: string }>();
  const data = variant === 'hhs' ? HHS : B28;
  const floorKey = variant === 'hhs' ? '0' : '3';
  const floorLabel = variant === 'hhs' ? 'the open-plan office' : 'Floor 3';

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        <RelatednessView data={data} floorKey={floorKey} floorLabel={floorLabel} />
      </div>
    </div>
  );
}
