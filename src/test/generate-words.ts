/**
 * Generate properly validated Albanian 5-token words
 */
import { tokenizeAlbanian } from '../core/tokenizer';

// Candidate words to test
const candidateWords = [
  // Simple 5-letter words (no digraphs)
  'ARUSH', 'ARSYE', 'BLERIM', 'BUZË', 'CAFKË', 'CILIK', 'COPË', 'ÇELËS',
  'ÇARÇAF', 'ÇIKRIK', 'DAJË', 'DALIP', 'DARKE', 'DASMA', 'DËNIM', 'DHELPËR',
  'DHEMBË', 'DHËNË', 'DHJETË', 'DHOMA', 'DHOMË', 'DHUNË', 'DIELL', 'DIMËR',
  'DITAR', 'DITË', 'DORË', 'DREDHI', 'DRITË', 'DRURI', 'DURRËS', 'DYERT',
  'DYQAN', 'DHJEU', 'ERËRË', 'FAQE', 'FAQJA', 'FARË', 'FEMËR', 'FENER',
  'FERMA', 'FËMIJË', 'FËRKË', 'FILAN', 'FILMI', 'FJALË', 'FJALOR', 'FLAMUR',
  'FLETË', 'FLLAD', 'FLUTUR', 'FOLE', 'FORCË', 'FORMË', 'FRESKI', 'FRIKË',
  'FRUTA', 'FSHATI', 'FSHESA', 'FSHIRË', 'FTESË', 'FUQI', 'FURÇË', 'FUSHA',
  'FYELL', 'FYTYRA', 'GABIM', 'GAFIL', 'GAJRET', 'GALAT', 'GËZIM', 'GËZUAR',
  'GJAKË', 'GJARPËR', 'GJATË', 'GJASHTË', 'GJELLA', 'GJERË', 'GJETHË', 'GJETUR',
  'GJITHË', 'GJUHË', 'GJYKATË', 'GJYSË', 'GJYSHI', 'GOJË', 'GOMË', 'GOSTI',
  'GROSHË', 'GRUA', 'GRUAJA', 'GRURË', 'GRYKE', 'GURË', 'HAJDUT', 'HAJTHME',
  'HALLE', 'HAMBAR', 'HAPUR', 'HARXHIM', 'HASME', 'HEKUR', 'HELMË', 'HËNË',
  'HEQJE', 'HESHTJE', 'HIDHUR', 'HIJË', 'HIJE', 'HUMBI', 'HUNDË', 'HUTIM',
  'HYQYMET', 'HYRI', 'IDHULL', 'ILAÇ', 'ISHTE', 'ISHULL', 'JABLLKË', 'JANAR',
  'JASHTË', 'JAVË', 'JETË', 'JETIM', 'JORGAN', 'KAFJA', 'KAFSHË', 'KALLAM',
  'KAMËR', 'KANAL', 'KANAVACË', 'KARAFIL', 'KARBUNXH', 'KASË', 'KATËR', 'KËMBË',
  'KËNDIM', 'KËNGË', 'KËPUCË', 'KËRCIM', 'KËRKESË', 'KËSHILLË', 'KËTIJ', 'KËTU',
  'KILAR', 'KISHË', 'KLASË', 'KLARNET', 'KLLAPI', 'KLLOKË', 'KLLOMTH', 'KLLOXHE',
  'KODËR', 'KOHË', 'KOKË', 'KOKËRR', 'KOLLTUK', 'KOMBË', 'KONTË', 'KOPIL',
  'KOPSHTI', 'KOPSË', 'KORRIK', 'KORSË', 'KOSTO', 'KRAH', 'KREJT', 'KRENA',
  'KRIP', 'KRIPË', 'KRISMË', 'KRYQË', 'KUAJT', 'KUFIJ', 'KUJDËS', 'KUJTESË',
  'KULAÇ', 'KULLA', 'KULTURË', 'KUPOLË', 'KUQE', 'KURRË', 'KUSËRË', 'KUSH',
  'KUSHËRI', 'KUVEND', 'KYÇË', 'LAJME', 'LAKËR', 'LAPSË', 'LAPSI', 'LARASË',
  'LARG', 'LARTË', 'LARGË', 'LEGJENDË', 'LEHTË', 'LEKURË', 'LEMËS', 'LËNË',
  'LEPURË', 'LETËR', 'LEVË', 'LIBËR', 'LIBRA', 'LIDHJE', 'LIGË', 'LIGJË',
  'LIMË', 'LIQEN', 'LISTË', 'LLAFE', 'LLAMBA', 'LLAMË', 'LLASTIKË', 'LLOJË',
  'LLOKUM', 'LLULLË', 'LOJË', 'LOKAL', 'LOPË', 'LOPE', 'LUAN', 'LUFTË',
  'LUGË', 'LULE', 'LULË', 'LULJA', 'LUMË', 'LUMTUR', 'LUTJE', 'MAGJEPSJE',
  'MAHMUZË', 'MAJË', 'MAJTAS', 'MAKEDONË', 'MALAZEZ', 'MALE', 'MALL', 'MALLKË',
  'MALORE', 'MANATË', 'MANGULL', 'MANUSHAQE', 'MARANGOZ', 'MARRË', 'MARS',
  'MASKA', 'MASË', 'MBAJTË', 'MBARË', 'MBESHTJELLË', 'MBIJË', 'MBITË', 'MBRET',
  'MBRËMË', 'MBUROJË', 'MBYLLË', 'MËKAT', 'MËKËMBË', 'MËNGË', 'MËNYRË', 'MËRZIT',
  'MËSHIRË', 'MESDITË', 'METËR', 'MIKU', 'MIRË', 'MIRRË', 'MISHË', 'MITËR',
  'MJAFT', 'MJEGULLË', 'MJEK', 'MJEKËR', 'MJEKRA', 'MJET', 'MLLEF', 'MODË',
  'MOHIM', 'MOLLË', 'MOND', 'MONEL', 'MONTË', 'MORËN', 'MORI', 'MOTËR',
  'MOZAIK', 'MREKULLI', 'MUAJ', 'MUAJI', 'MUNDESË', 'MUNDIM', 'MURE', 'MURET',
  'MURME', 'MURRË', 'MUSAFIR', 'MUSHKË', 'MUZG', 'MUZE', 'NAFTË', 'NAMAZË',
  'NAMI', 'NANË', 'NATË', 'NDALIM', 'NDARJE', 'NDIHMË', 'NDJEKJE', 'NDJENJË',
  'NDJESË', 'NDREQUR', 'NDRYSHIM', 'NDËRPRERJE', 'NEGËR', 'NËNË', 'NËNTË',
  'NËNTOR', 'NESËR', 'NEUMË', 'NIPI', 'NISJE', 'NITËR', 'NJËQIND', 'NJËSH',
  'NJERI', 'NJËZET', 'NJOHJE', 'NJOLLA', 'NJONJI', 'NOTË', 'NUMËR', 'NUSË',
  'NXEHTË', 'NXËNËS', 'OBLIGË', 'OMBRELLË', 'ORARI', 'OREN', 'ORTEK', 'PAGË',
  'PAJIM', 'PAJTIM', 'PALARË', 'PALLAT', 'PALLDHI', 'PAMJE', 'PAMUNDUR', 'PANXHAR',
  'PAPAGALL', 'PARA', 'PARACETË', 'PARADITE', 'PARASHIKË', 'PARATHENJË', 'PARDHE',
  'PARET', 'PARKË', 'PASDITË', 'PASQYRË', 'PASURË', 'PATUR', 'PAVZË', 'PËLLËMBË',
  'PEMË', 'PERDE', 'PËRFYTYRË', 'PËRGËZIM', 'PËRGJIGJE', 'PËRGJUMJE', 'PERIN',
  'PËRKUJDESJE', 'PËRKUNDËR', 'PËRMASË', 'PËRPARË', 'PËRPJEKJE', 'PËRRALLË', 'PËRRAHE',
  'PËRSE', 'PËRRUA', 'PËRSËRITJE', 'PËRTESË', 'PËRTHYERJE', 'PESHË', 'PESHK', 'PESHKATAR',
  'PESË', 'PETRITË', 'PIJE', 'PIKTOR', 'PILAF', 'PIRAMIDË', 'PIRG', 'PISË',
  'PISTË', 'PJATË', 'PLAGË', 'PLAKË', 'PLAN', 'PLAZH', 'PLEHËRË', 'PLEP',
  'PLESHTI', 'PLESHT', 'PLLAJË', 'PLLAKË', 'PLLUMB', 'PLUHUR', 'POEMË', 'POLIC',
  'PORTË', 'POSË', 'POSHTË', 'POTERE', 'PRANVERE', 'PREHËR', 'PREJ', 'PRIND',
  'PRITË', 'PRITJE', 'PRUSHË', 'PROVË', 'PSHERËTIMË', 'PULË', 'PULT', 'PUNË',
  'PUNISHTE', 'PUNËTOR', 'PUPËL', 'PUSHIM', 'PUSHKË', 'PUSHTET', 'PYLL', 'PYLLI',
  'PYLL', 'PYETJE', 'QAFË', 'QARK', 'QELESHE', 'QELIZË', 'QEMAL', 'QENDËR',
  'QENGJI', 'QËNDRIM', 'QEPALLË', 'QEPË', 'QERAMIKË', 'QERSHË', 'QESE', 'QETË',
  'QIELL', 'QILIM', 'QIND', 'QIPË', 'QITJE', 'QOFTË', 'QORR', 'QOSHE', 'QYQE',
  'QYTET', 'QYTETI', 'RADIO', 'RAKI', 'RAMË', 'RAST', 'RATH', 'RECETË',
  'REGJISTËR', 'REMBË', 'RENDË', 'RENDI', 'RESH', 'RETH', 'RETHË', 'RETË',
  'REVISTË', 'REZIKË', 'RINAS', 'RINI', 'RITET', 'RITËM', 'ROBËR', 'ROMAN',
  'RRASHË', 'RRATH', 'RREGULL', 'RREMBË', 'RREMË', 'RRESHTI', 'RREZIK', 'RREZE',
  'RRIMË', 'RRJEDHE', 'RRJEDHË', 'RRJETË', 'RROBA', 'RROBAQEPËS', 'RROFTË', 'RROTË',
  'RRUGË', 'RRUSHI', 'RRUSH', 'SABAHË', 'SAHAT', 'SAJË', 'SAKË', 'SALCË',
  'SALLAT', 'SANDËRË', 'SANDUÇE', 'SANKTË', 'SAPUN', 'SARMA', 'SEHËR', 'SEKONDË',
  'SENDË', 'SENDE', 'SEREN', 'SËMUNDË', 'SËMURE', 'SËRME', 'SHAKA', 'SHALË',
  'SHAMI', 'SHARRË', 'SHEGA', 'SHEJTËR', 'SHEKULL', 'SHËMBULL', 'SHËNDËT', 'SHËNIME',
  'SHËNIT', 'SHEQER', 'SHËRBETORE', 'SHËRBIM', 'SHESH', 'SHESHË', 'SHIJË', 'SHIKË',
  'SHISHË', 'SHISHE', 'SHITET', 'SHIU', 'SHKALLË', 'SHKËLQYER', 'SHKËMBË', 'SHKËNDIJË',
  'SHKENCORE', 'SHKOLLË', 'SHKOQITJE', 'SHKOPINJ', 'SHKRESË', 'SHKRIMTARE', 'SHKRINJË',
  'SHKRONJË', 'SHKUMËS', 'SHKURT', 'SHKURTËR', 'SHNDËRRUAR', 'SHNDRITE', 'SHOKË', 'SHOKU',
  'SHPEJTË', 'SHPËRTHIM', 'SHPIKJE', 'SHPINË', 'SHPIRTË', 'SHPJEGIM', 'SHPORTË', 'SHPRESË',
  'SHPUZË', 'SHQETË', 'SHQIPËRI', 'SHQIPE', 'SHQIPTAR', 'SHQIPONJË', 'SHQIPTAR', 'SHQIPE',
  'SHQIPTARE', 'SHTATË', 'SHTATZËNË', 'SHTEG', 'SHTEGTARE', 'SHTËPI', 'SHTËPINË', 'SHTËPISË',
  'SHTETË', 'SHTETIT', 'SHTETORE', 'SHTJELLË', 'SHTOJCË', 'SHTRAT', 'SHTRIGË', 'SHTRUAR',
  'SHTUNË', 'SHTYPJE', 'SIGURT', 'SIKUR', 'SIMBOLE', 'SIMFONI', 'SINANI', 'SINDIKATE',
  'SINEMA', 'SIPËR', 'SISTEM', 'SKEMË', 'SKENË', 'SKIFTER', 'SKUADËR', 'SKUTË',
  'SLLAM', 'SLLOMOTINË', 'SOFËR', 'SOFTË', 'SOKAK', 'SONË', 'SONTE', 'SOPRË',
  'SPORTË', 'SPURK', 'STAFETË', 'STALLË', 'STËRVITOR', 'STINË', 'STOLLE', 'STOPË',
  'STUDIUES', 'STUDIM', 'SYRI', 'SYTË', 'TABAK', 'TABELË', 'TAKIM', 'TAKIME',
  'TAKSË', 'TALLJE', 'TANI', 'TAPË', 'TARABUK', 'TARRACË', 'TATIM', 'TAVAN',
  'TAVË', 'TEATE', 'TEATËR', 'TEKNOLOGJI', 'TELASH', 'TELEVIZOR', 'TEMBËL', 'TENDA',
  'TENDERË', 'TENIS', 'TEORI', 'TËRBORË', 'TËRHEQJE', 'TËRMET', 'TËRTHORE', 'TETË',
  'TEZGË', 'THARM', 'THATË', 'THEKNOLOGJI', 'THELLË', 'THEMËL', 'THËNKË', 'THEPISURE',
  'THERRJE', 'THERTORE', 'THIKË', 'THJESHTE', 'THJESHT', 'THURJE', 'THURRËM', 'TIFOZ',
  'TIGAN', 'TIRANI', 'TJETËR', 'TJETRI', 'TOKË', 'TOPË', 'TORTË', 'TRASHË',
  'TRAZË', 'TREMË', 'TREN', 'TRENI', 'TRENDAFIL', 'TREPË', 'TRESH', 'TRETJE',
  'TRIKULLI', 'TRIMË', 'TRISHTE', 'TROFE', 'TROFTA', 'TROKË', 'TRUTË', 'TUAJ',
  'TUFË', 'TURPË', 'TYMË', 'TYMNAJË', 'UDHE', 'UDHETARE', 'UDHËTIM', 'UDHËZIM',
  'UDHËHEQJE', 'UJDHE', 'UJDISE', 'UJËVARË', 'UJËT', 'UJORE', 'UJQER', 'UJQIT',
  'UJTË', 'UJËRAT', 'ULËT', 'ULLINJE', 'ULLINJ', 'ULLIRI', 'ULLI', 'ULLUK',
  'ULQINË', 'URAT', 'URDHËRESË', 'URDHËR', 'UREME', 'URGJENCË', 'URISË', 'UROJË',
  'URRË', 'URREJTË', 'URTH', 'USHQIM', 'USTARE', 'UTANI', 'VABOR', 'VAJIT',
  'VAJZË', 'VALLË', 'VALLE', 'VARET', 'VASHË', 'VATRË', 'VDEKJE', 'VDEKUR',
  'VEGEL', 'VENDË', 'VEND', 'VENDI', 'VENDIM', 'VEPËR', 'VEPRA', 'VERDHË',
  'VERË', 'VERA', 'VESHË', 'VESH', 'VESHJE', 'VETË', 'VETIM', 'VETULL',
  'VIDHJË', 'VIJË', 'VIJUESE', 'VINJAK', 'VITET', 'VITI', 'VITULË', 'VJEDHË',
  'VJEDH', 'VJEHËR', 'VJERR', 'VJERSHË', 'VJETËR', 'VJETËR', 'VJOLLCË', 'VLERA',
  'VLERË', 'VOGËL', 'VOKALE', 'VOLAR', 'VORBULLË', 'VORBULL', 'VOZITJE', 'VRANË',
  'VRARE', 'VRASJE', 'VRAZHDË', 'VRESHTË', 'VRIMË', 'VRULL', 'XHAKË', 'XHAKETE',
  'XHAM', 'XHAMI', 'XHAXHA', 'XHELATË', 'XHENET', 'XHEPË', 'XHEPAT', 'XHEVAHIR',
  'XHINDË', 'XHUF', 'XHUNGËL', 'XHUVE', 'YLLË', 'YLLI', 'YLLËT', 'YSHTJE',
  'ZAMBAK', 'ZANAF', 'ZANAT', 'ZARF', 'ZBATIM', 'ZBAVITJE', 'ZBATICË', 'ZBEHË',
  'ZBOR', 'ZBRAZËT', 'ZBRITJE', 'ZBUKURIM', 'ZBULIM', 'ZBULUAR', 'ZBUTJE', 'ZELOTE',
  'ZEMËR', 'ZEMRA', 'ZENË', 'ZËNKË', 'ZËRE', 'ZERË', 'ZEZË', 'ZGAFRË',
  'ZGAVRË', 'ZGJIDHJE', 'ZGJEDHË', 'ZGJUARË', 'ZGJUEM', 'ZGJIDHË', 'ZHARGON', 'ZHDUKJE',
  'ZHELE', 'ZHGABË', 'ZHUBË', 'ZHURMË', 'ZHURME', 'ZHVENDOSJE', 'ZHVILLIM', 'ZHYTJE',
  'ZILE', 'ZJARR', 'ZJARRË', 'ZJARRI', 'ZOGJË', 'ZOGOJ', 'ZOGTH', 'ZOMBI',
  'ZONJË', 'ZONJA', 'ZONJUSHË', 'ZORRË', 'ZOTËR', 'ZOTËRI', 'ZOTËRORE', 'ZVOGË',
];

// Test all candidates
const validWords: string[] = [];
const invalidWords: { word: string; count: number; tokens: string[] }[] = [];

candidateWords.forEach(word => {
  const upperWord = word.toUpperCase();
  const tokens = tokenizeAlbanian(upperWord, new Set(candidateWords.map(w => w.toUpperCase())));
  
  if (tokens.length === 5) {
    validWords.push(upperWord);
  } else {
    invalidWords.push({ word: upperWord, count: tokens.length, tokens });
  }
});

console.log(`\n=== Validation Results ===`);
console.log(`Total candidates: ${candidateWords.length}`);
console.log(`Valid 5-token words: ${validWords.length}`);
console.log(`Invalid words: ${invalidWords.length}\n`);

console.log(`Valid words list (copy to words.ts):`);
console.log(`[\n  '${validWords.join("',\n  '")}',\n]`);

if (invalidWords.length > 0) {
  console.log(`\n\nFirst 30 invalid words (for reference):`);
  invalidWords.slice(0, 30).forEach(({ word, count, tokens }) => {
    console.log(`  ${word} (${count} tokens): [${tokens.join(', ')}]`);
  });
}
