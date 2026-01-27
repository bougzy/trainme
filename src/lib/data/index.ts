import { frontendChallenges } from './frontend';
import { backendChallenges } from './backend';
import { fullstackChallenges } from './fullstack';
import { algorithmChallenges } from './algorithms';
import { behavioralChallenges } from './behavioral';
import type { Challenge, Category } from '../types';

export const allChallenges: Challenge[] = [
  ...frontendChallenges,
  ...backendChallenges,
  ...fullstackChallenges,
  ...algorithmChallenges,
  ...behavioralChallenges,
];

export function getAllChallenges(): Challenge[] {
  return allChallenges;
}

export function getChallengeById(id: string): Challenge | undefined {
  return allChallenges.find(c => c.id === id);
}

export function getChallengesByCategory(category: Category): Challenge[] {
  return allChallenges.filter(c => c.category === category);
}

export function getChallengesBySubcategory(category: Category, subcategory: string): Challenge[] {
  return allChallenges.filter(c => c.category === category && c.subcategory === subcategory);
}
