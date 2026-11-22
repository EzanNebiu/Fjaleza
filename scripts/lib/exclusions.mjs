/**
 * Exclusion lists for the ANSWER list only (these words may still be valid guesses,
 * except OFFENSIVE which is removed from both lists).
 *
 * FUNCTION_WORDS: grammatical words (auxiliaries, pronouns, conjunctions, adverbs of
 * time/place, question words). They are real and frequent, but make dull puzzles.
 *
 * OFFENSIVE: vulgar or insulting words. Matched as exact forms and as prefixes
 * (OFFENSIVE_STEMS) so inflected forms are caught too.
 */

export const FUNCTION_WORDS = new Set([
  'është', 'ishte', 'ishin', 'ishim', 'ishit', 'jemi', 'jeni', 'janë', 'kemi', 'keni', 'kanë',
  'kisha', 'kishe', 'kishte', 'kishim', 'kishit', 'kishin', 'duhet', 'duhej', 'duhen', 'mund',
  'vetëm', 'asgjë', 'diçka', 'dikush', 'askush', 'çfarë', 'kështu', 'ashtu', 'sikur', 'sepse',
  'pastaj', 'ndoshta', 'mbase', 'madje', 'tashmë', 'akoma', 'gjithë', 'gjatë', 'rreth', 'drejt',
  'prapa', 'prapë', 'këtej', 'andej', 'atëherë', 'tillë', 'tjera', 'tjerë', 'tjetër', 'cilin',
  'cilën', 'cilat', 'cilët', 'cilës', 'cilit', 'kujt', 'kësaj', 'asaj', 'atyre', 'këtyre',
  'tuajt', 'tënde', 'tënd', 'tuaja', 'tuajë', 'jotja', 'ytija', 'imja', 'jonë', 'juaji', 'juaja',
  'saktë', 'qoftë', 'qenka', 'pasur', 'thënë', 'dhënë', 'marrë', 'ardhë', 'ndonjë', 'sipër',
  'poshtë', 'jashtë', 'brenda', 'përpara', 'përse', 'nëpër', 'ndërsa', 'pavarë', 'sidoqoftë',
  'kurrë', 'gjithmonë', 'sonte', 'nesër', 'tani', 'atje', 'këtu', 'edhe', 'ende', 'vetes',
  'veten', 'vetja', 'unë', 'ndaj', 'lutem', 'falni', 'mirë', 'vërtet', 'larg', 'afër', 'pranë',
  'mbi', 'nën', 'kundër', 'pas', 'para', 'tutje', 'ngado', 'kudo', 'gjësend', 'secili', 'tanët',
  'tonën', 'tonës', 'tonat', 'tuajn', 'tënden', 'kujë', 'këtij', 'atij', 'kësaj', 'këtë', 'atë',
]);

export const OFFENSIVE = new Set([
  'kurvë', 'kurva', 'lavire', 'bythë', 'bytha', 'pidhi', 'pidhe', 'karin', 'qifsh', 'qifte',
  'muti', 'mutin', 'mutit', 'kurvar', 'shkërdhatë', 'pisllëk', 'bastard', 'cigan', 'cigani',
  'arixhi', 'shkije', 'magjup', 'magjupi', 'zezak', 'zezaku', 'pederi', 'peder',
]);

/** Prefixes that mark a vulgar stem; any word starting with one is excluded everywhere. */
export const OFFENSIVE_STEMS = ['kurv', 'pidh', 'qij', 'qif', 'byth', 'lavir', 'pederast', 'bastard', 'karin'];

/**
 * SENSITIVE: real words that are fine to type but should never be the daily answer
 * (insults, death and violence, disability used as an insult).
 */
export const SENSITIVE = new Set([
  'idiot', 'idiote', 'idiotë', 'budall', 'budalla', 'kopil', 'kopile', 'derri', 'gomar', 'gomari',
  'zuzar', 'horri', 'horra', 'hajvan', 'teveqel', 'trapi', 'qorri', 'sakat', 'sakati', 'lesh',
  'vdekur', 'vdiq', 'vdesë', 'vdesin', 'vrarë', 'vrasë', 'vrasje', 'vrava', 'vrau', 'vriti',
  'vrasin', 'vrasi', 'vrisni', 'vritu', 'vrite', 'vrita', 'vritë', 'armik', 'luftë', 'plumb',
  'bomba', 'bombë', 'gjaku', 'gjaku', 'varrë', 'varri', 'kufom', 'kufoma', 'djall', 'djalli',
]);

export function isOffensive(word) {
  return OFFENSIVE.has(word) || OFFENSIVE_STEMS.some((s) => word.startsWith(s));
}
