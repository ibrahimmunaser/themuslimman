import type { Part, Era, EraInfo } from "./types";
import { ERAS } from "./types";
import { getPartAssetUrls } from "./files";

function makePart(
  num: number,
  title: string,
  subtitle: string,
  era: Era,
  description: string,
  includeInEssentials: boolean,
  duration = ""
): Part {
  return {
    id: `part-${num}`,
    partNumber: num,
    title,
    subtitle,
    era,
    description,
    duration: duration || undefined,
    includedInEssentials: includeInEssentials,
    assets: {
      // Assets will be loaded dynamically
      videoUrl: undefined,
      audioUrl: undefined,
      briefingText: undefined,
      statementOfFactsText: undefined,
      studyGuideText: undefined,
      reportText: undefined,
      mindmapUrl: undefined,
      infographics: {
        concise: undefined,
        standard: undefined,
        bentoGrid: undefined,
      },
      slides: { presented: [], detailed: [], facts: [] },
    },
  };
}

export const PARTS: Part[] = [
  // ── Pre-Islamic Arabia ────────────────────────────────────────────────────
  makePart(1,  "The Pre-Islamic Arabian Context",              "Setting the Stage",                        "pre-islamic", "An overview of the Arabian Peninsula — its geography, peoples, and the conditions that made it the soil into which the final revelation would be planted.", true),
  makePart(2,  "Arab Tribes and Their Migrations",             "Origins of a People",                      "pre-islamic", "The genealogical and migratory history of the Arab tribes — who they were, where they came from, and the tribal identity that defined their world.", true),
  makePart(3,  "Political Structures in Pre-Islamic Yemen",    "Kingdoms of the South",                    "pre-islamic", "The political landscape of southern Arabia, the rise and fall of its kingdoms, and how Yemen's rulers fit into the broader regional order before Islam.", false),
  makePart(4,  "The Kingdom of Hirah",                         "A Persian-Arab Buffer State",              "pre-islamic", "Hirah: the Arab client kingdom under Persian suzerainty, its role as a frontier buffer between empires, and how it shaped Arab political consciousness.", false),
  makePart(5,  "The Ghassanids of Syria",                      "Arab Clients of Byzantium",                "pre-islamic", "The Ghassanid dynasty — Arab rulers in Syria under Byzantine influence — and the role they played in the geopolitical tensions that surrounded early Islam.", false),
  makePart(6,  "Makkah's Guardians Before Islam",              "Custodianship of the Sacred City",         "pre-islamic", "The story of how the Quraysh came to control Makkah and the Ka'bah — the political arrangements, the custodial duties, and the prestige that came with it.", true),
  makePart(7,  "From Monotheism to Idolatry",                  "How Arabia Lost the Faith of Ibrahim ﷺ",  "pre-islamic", "The religious transformation of the Arabs — from the pure monotheism of Ibrahim to a system of polytheism and idol-worship that filled the Ka'bah with statues.", true),
  makePart(8,  "The Religious Landscape of Pre-Islamic Arabia","A Complex Tapestry of Belief",             "pre-islamic", "Beyond idolatry: the full spectrum of religious practice in Arabia before Islam — hanifs, Jewish and Christian communities, soothsayers, and superstition.", false),
  makePart(9,  "Pre-Islamic Arabian Society",                  "Tribes, Honor, and Custom",                "pre-islamic", "The social structure of Arabia — the centrality of the tribe, the code of honor, the role of women, and the moral contradictions of a society shaped by jahiliyyah.", true),
  makePart(10, "The Socio-Economic World Before Islam",        "Poverty, Trade, and Ethics",               "pre-islamic", "The economic realities of pre-Islamic Arabia — trade routes, class divisions, the treatment of the poor and vulnerable, and the ethical voids that Islam would fill.", false),

  // ── Birth & Early Life ────────────────────────────────────────────────────
  makePart(11, "The Lineage of the Prophet ﷺ",                "A Noble Chain of Ancestry",                "birth-early-life", "Tracing the genealogy of the Prophet Muhammad ﷺ — the chain of nobility from Adam through Ibrahim and Ismail to the man chosen to carry the final message.", true),
  makePart(12, "The Family of Hashim",                         "Custodians of Makkah",                     "birth-early-life", "The Hashimite line — the Prophet's immediate family tree, their role in Makkah, and the figures who would shape his earliest years.", true),
  makePart(13, "The Early Life of the Prophet ﷺ",             "A Childhood Under Divine Care",            "birth-early-life", "The birth of the Prophet ﷺ, the death of his father before birth, his years with his wet-nurse Halimah, and the early signs of divine protection.", true),
  makePart(14, "The Character of Muhammad ﷺ Before Prophethood", "Al-Ameen — The Trustworthy One",       "birth-early-life", "How the Prophet ﷺ was known in Makkah before revelation — his honesty, his moral character, his aversion to idolatry, and why his people called him al-Ameen.", true),

  // ── Beginning of Revelation ───────────────────────────────────────────────
  makePart(15, "The First Revelation",                         "Iqra! — The Night That Changed the World", "early-revelation", "The Prophet ﷺ retreats to Cave Hira. Angel Jibreel appears. The first verses of the Quran are delivered. Every detail of this momentous night examined.", true),
  makePart(16, "The Nature of Prophetic Revelation",           "How the Quran Was Sent Down",              "early-revelation", "The multiple forms in which revelation came to the Prophet ﷺ — the ringing of a bell, the vision, the direct speech — and what each meant for his mission.", true),
  makePart(17, "The Early Phases of the Call to Islam",        "A Secret Mission in Makkah",               "early-revelation", "Islam spreads quietly in its first phase — house by house, heart by heart. Who were the earliest believers and how did they come to accept the faith?", true),
  makePart(18, "The Islamic Call and the Establishment of Prayer", "The First Rituals of Worship",         "early-revelation", "How the early Muslim community began to worship — the establishment of the prayer, its early forms, and its role in building the first community of believers.", false),
  makePart(19, "The Transition to Open Preaching",             "Taking the Message Public",                "early-revelation", "The command comes: announce what you have been ordered. How the Prophet ﷺ navigated the transition from private dawah to public proclamation in Makkah.", true),
  makePart(20, "The Public Proclamation in Makkah",            "Quraysh Hears the Call",                   "early-revelation", "The Prophet ﷺ climbs Mount Safa and calls out to Quraysh. The first public declaration of Islam and the reactions it provoked — from curiosity to outright hostility.", true),

  // ── Makkah — Persecution ──────────────────────────────────────────────────
  makePart(21, "Quraysh's Opposition Strategies",              "How They Fought the Message",              "makkah-persecution", "The Quraysh's systematic campaign against Islam — mockery, accusations of madness, economic pressure, and misinformation — and how these tactics were countered.", true),
  makePart(22, "The Persecution of Early Muslims",             "A Price Paid for Faith",                   "makkah-persecution", "The brutal torture of the weakest Muslims in Makkah — Bilal, Sumayyah, Yasir, and others — and what their steadfastness reveals about the nature of faith.", true),
  makePart(23, "Early Muslim Strategies: Secrecy and Migration","Surviving in Makkah",                     "makkah-persecution", "How the early community survived — the use of Dar al-Arqam, the first migration to Abyssinia, and the brilliant speech of Ja'far ibn Abi Talib before the Negus.", true),
  makePart(24, "Quraysh's Campaign Against Islam in Abyssinia","The Diplomatic Battle Abroad",             "makkah-persecution", "Quraysh sends emissaries to the Negus to demand the return of the Muslim refugees. The confrontation in the king's court and its remarkable outcome.", false),
  makePart(25, "The Escalation of Hostilities in Makkah",      "When Words Were No Longer Enough",         "makkah-persecution", "As the dawah grows, Quraysh's response intensifies. The tightening of the siege on Muslims and the Prophet ﷺ, and the community's response to mounting pressure.", false),
  makePart(26, "The Conversions of Hamzah and Umar رضي الله عنهما", "Two Giants Embrace Islam",           "makkah-persecution", "The Islam of Hamzah ibn Abd al-Muttalib and then Umar ibn al-Khattab — two powerful Qurayshi men whose conversions transformed the balance of power in Makkah.", true),
  makePart(27, "Quraysh's Shifting Strategies and Clan Politics","The Internal Dynamics of Opposition",    "makkah-persecution", "As earlier tactics fail, Quraysh adapts. The political negotiations, the attempts to buy out the Prophet ﷺ, and the tribal dynamics that complicated their resistance.", false),
  makePart(28, "The Quraysh Boycott of Banu Hashim",           "Three Years of Siege and Starvation",      "makkah-persecution", "The economic and social boycott against the Prophet's ﷺ clan — written in parchment and hung in the Ka'bah — and the three grueling years spent in Shi'b Abi Talib.", true),
  makePart(29, "The Final Negotiations in Makkah",             "Quraysh's Last Attempts at Compromise",    "makkah-persecution", "With the message growing, Quraysh makes its final offers of compromise — power, wealth, and honor. The Prophet ﷺ refuses. The lines are drawn permanently.", false),
  makePart(30, "The Year of Grief",                            "The Death of Khadijah and Abu Talib",      "makkah-persecution", "The Prophet ﷺ loses his wife, his greatest supporter, and his protector in the same year. The personal devastation and the political vulnerability this created.", true),
  makePart(31, "The Journey to Taif",                          "Rejection and Divine Mercy",               "makkah-persecution", "The Prophet ﷺ travels alone to Taif seeking support — and is pelted with rocks by its people. The dua he made that day. What the Angel of the Mountains offered. What he chose.", true),
  makePart(32, "Pre-Hijrah Da'wah in Makkah",                  "Seeking a New Home for Islam",             "makkah-persecution", "The Prophet ﷺ approaches tribes during Hajj season, seeking protection and support. The encounters that slowly opened the door toward Madinah.", false),
  makePart(33, "The Eleventh Year of Prophethood",             "On the Eve of the Great Change",           "makkah-persecution", "The final period in Makkah before the hijrah — the small signs of hope, the growing urgency, and how the pieces began moving toward the momentous migration.", false),
  makePart(34, "The Isra and Mi'raj",                          "The Night Journey and Ascension",          "makkah-persecution", "The Prophet ﷺ is taken by night from Makkah to Jerusalem, then ascends through the seven heavens. One of the most profound events in the entire Seerah.", true),

  // ── The Hijrah ────────────────────────────────────────────────────────────
  makePart(35, "The First Pledge of Aqabah",                   "Yathrib Answers the Call",                 "hijrah", "A group from Yathrib embraces Islam at Makkah and makes the first pledge of allegiance — the seed of what would become the Ummah's new home.", true),
  makePart(36, "The Second Pledge of Aqabah",                  "A Covenant of Protection",                 "hijrah", "Seventy-three men and two women from Yathrib make a formal pledge of protection to the Prophet ﷺ — a political covenant that made the Hijrah possible.", true),
  makePart(37, "The Quraysh Plot and the Decision to Migrate", "The Night of Departure",                   "hijrah", "Quraysh convenes its council and plots to kill the Prophet ﷺ. The divine command to leave. How the assassination was foiled. The Prophet ﷺ and Abu Bakr slip away in the night.", true),
  makePart(38, "The Migration to Madinah",                     "A Journey That Changed the World",         "hijrah", "From Cave Thawr to the arrival in Quba — the three-day journey of the Prophet ﷺ and Abu Bakr, the people they met, and the city that awaited them with open arms.", true),

  // ── Madinah Period ────────────────────────────────────────────────────────
  makePart(39, "The Foundation of the Madinan Community",      "Building a New Civilization",              "madinah", "The Prophet ﷺ arrives in Madinah and begins constructing the foundations of a new society — the mosque, the brotherhood between emigrants and helpers, and the social covenant.", true),
  makePart(40, "The Foundation of Islamic Society in Madinah", "Brotherhood, Mosque, and Market",          "madinah", "The practical building of the early Madinan community — the physical construction of the mosque, the pairing of Muhajirun and Ansar, and the first economic arrangements.", false),
  makePart(41, "The Charter and Ethical Foundations of Madinah","A New Social Order",                      "madinah", "The Prophet ﷺ establishes the Constitution of Madinah — the world's first written multi-community social contract. Its terms, its parties, and its revolutionary implications.", true),
  makePart(42, "The Pact of Madinah",                          "Islam and Inter-Community Relations",      "madinah", "An in-depth analysis of how the Prophet ﷺ structured relationships between Muslims, Jewish tribes, and other communities in Madinah — and what this teaches about Islamic governance.", false),
  makePart(43, "The Transition to Armed Defense",              "When Fighting Became Lawful",              "madinah", "The Quranic permission for defensive combat — its conditions, its context, and the profound shift it represented from years of patient endurance in Makkah.", true),
  makePart(44, "Pre-Badr Military and Political Developments", "The Stage Is Set",                         "madinah", "The small expeditions and skirmishes before Badr — the first Islamic military operations, their purposes, and how they set the stage for the defining confrontation.", false),

  // ── Major Campaigns ───────────────────────────────────────────────────────
  makePart(45, "The Battle of Badr",                           "The Day of Criterion",                     "campaigns", "313 Muslims against 1,000 Qurayshi fighters on the plains of Badr. The divine intervention, the turning points, and why this battle is the single most important military event in the Seerah.", true),
  makePart(46, "The Battle of Badr: A Redefinition of Loyalty","Who Stood With Allah?",                    "campaigns", "The human stories within Badr — how families were split, how old loyalties collapsed, and what this battle revealed about the nature of true allegiance to faith.", false),
  makePart(47, "The Aftermath of Badr",                        "Prisoners, Ransom, and Consequences",      "campaigns", "How the Prophet ﷺ handled the prisoners of Badr, the debate over their fate, and the far-reaching consequences — political, social, and spiritual — of Badr's outcome.", true),
  makePart(48, "The Strategic Environment After Badr",         "A Changed Landscape",                      "campaigns", "The defeat at Badr sent shockwaves through Arabia. This part examines how Quraysh, the Jewish tribes, and the hypocrites responded to the new Muslim reality.", false),
  makePart(49, "The Political and Social Landscape After Badr","Madinah's New Reality",                    "campaigns", "The internal dynamics of Madinah after Badr — the position of the Ansar, the tensions with the Jewish tribes, and the emergence of the hypocrites as a force to reckon with.", false),
  makePart(50, "Post-Badr Conflicts: Banu Qaynuqa and the Sawiq Expedition", "The Embers of Opposition",  "campaigns", "Quraysh regroups while Banu Qaynuqa breaks its covenant in Madinah. The Prophet's ﷺ decisive responses and what they reveal about how he managed internal and external threats.", true),
  makePart(51, "Early Community Actions in the Third Year AH", "Consolidating the Ummah",                  "campaigns", "The expeditions and events of the third year — how the Muslim community continued to build its strength while managing an increasingly hostile regional environment.", false),
  makePart(52, "Military Confrontations Preceding Uhud",       "Quraysh Prepares for Revenge",             "campaigns", "Quraysh burns with humiliation after Badr. This part examines how they built the coalition that would march on Madinah at Uhud — the funding, the recruitment, and the motivation.", false),
  makePart(53, "The Battle of Uhud: Mobilization and Strategy","The Armies Gather",                        "campaigns", "The strategic deliberation before Uhud — the Prophet's vision, the debate over fighting inside or outside Madinah, and the formation of the Muslim army.", true),
  makePart(54, "Preparations for the Battle of Uhud",          "The Prophet's Army Takes Shape",           "campaigns", "The composition of the Muslim force, the command structure, and a pivotal pre-battle decision: the desertion of Abdullah ibn Ubayy and its impact on the army's size.", false),
  makePart(55, "Force Dispositions at Uhud",                   "Strategy at the Foot of the Mountain",     "campaigns", "How the Prophet ﷺ positioned his army, the critical role of the archers on the hilltop, and the explicit command that would — when disobeyed — change everything.", false),
  makePart(56, "The Opening of the Battle of Uhud",            "A Decisive Engagement Begins",             "campaigns", "The initial Muslim advance at Uhud — the fall of Quraysh's standard-bearers one by one, the early Muslim momentum, and the near-certain victory that seemed to be unfolding.", false),
  makePart(57, "The Great Reversal at Uhud",                   "How Victory Became Defeat",                "campaigns", "The archers descend from their position. Khalid ibn al-Walid seizes the gap. In minutes, a Muslim victory becomes a military disaster. The most important lesson of the entire Seerah.", true),
  makePart(58, "The Defense of the Prophet ﷺ at Uhud",        "Hearts That Would Not Waver",              "campaigns", "With the Prophet ﷺ isolated and wounded, a small group forms a human shield around him. Their individual stories of sacrifice — among the most moving in all of the Seerah.", true),
  makePart(59, "The Aftermath of the Battle of Uhud",          "Grief, Lessons, and Resolve",              "campaigns", "The immediate aftermath — the mutilation of Muslim martyrs, the grief of the survivors, and how the Prophet ﷺ guided his community through one of its darkest moments.", true),
  makePart(60, "The Expedition of Hamra' al-Asad",             "A Display of Strength After Defeat",       "campaigns", "The day after Uhud, wounded and exhausted, the Prophet ﷺ calls his army to march again. A demonstration of psychological resilience that deterred Quraysh from finishing what they started.", false),
  makePart(61, "Post-Uhud Military Engagements",               "The Battles That Followed",                "campaigns", "The series of military operations and confrontations in the months after Uhud — how the Muslim community regrouped and the shape of their military response evolved.", false),
  makePart(62, "Military and Diplomatic Developments in Years 4–5 AH", "The Landscape Continues to Shift", "campaigns", "The complex military and political developments of the fourth and fifth years after Hijrah — new alliances, new threats, and the escalating coalition against Madinah.", false),
  makePart(63, "The Battle of the Confederates",               "Ten Thousand at the Gates of Madinah",     "campaigns", "A coalition of 10,000 lays siege to Madinah. Salman al-Farisi's trench. The near-betrayal by Banu Quraydhah. The wind of Allah that ended the siege.", true),
  makePart(64, "The Expedition Against Banu Quraydhah",        "Accountability and Justice",               "campaigns", "After the Confederates depart, the Prophet ﷺ turns to Banu Quraydhah — who had broken their treaty during the siege. The judgment of Sa'd ibn Mu'adh and its aftermath.", true),
  makePart(65, "The Ghazwah of Banu al-Mustaliq",              "Hypocrisy Exposed",                        "campaigns", "The campaign against Banu al-Mustaliq becomes the backdrop for two defining crises: the slander against Aisha رضي الله عنها and the full unveiling of the hypocrites.", true),
  makePart(66, "Strategic and Diplomatic Operations in 6 AH",  "Maneuvering Before Hudaybiyah",            "campaigns", "The diplomatic and military maneuvers of the sixth year — the expeditions, the negotiations, and the careful positioning that set the stage for the Treaty of Hudaybiyah.", false),
  makePart(67, "The Treaty of al-Hudaybiyah",                  "A Clear Victory in Disguise",              "campaigns", "The Prophet ﷺ sets out for Umrah and is stopped at Hudaybiyah. The treaty's terms shock the companions. Allah calls it a 'clear victory.' Why?", true),
  makePart(68, "The Socio-Political Impact of Hudaybiyah",     "A Treaty That Transformed Arabia",         "campaigns", "In the two years after Hudaybiyah, more people entered Islam than in all the years before it. This part examines why — and the seismic shift in the Arabian balance of power.", false),
  makePart(69, "Post-Hudaybiyah Strategy and Diplomatic Outreach", "Islam Goes Global",                    "campaigns", "With Hudaybiyah providing security, the Prophet ﷺ launches an unprecedented diplomatic offensive — letters to the rulers of the world, inviting them to Islam.", true),
  makePart(70, "Correspondence with Egypt: The Muqawqas",      "Letters to the Powerful",                  "campaigns", "The Prophet's ﷺ letter to the Muqawqas of Egypt — his careful reception, his half-measures, and what the exchange reveals about how worldly power responds to divine truth.", false),
  makePart(71, "Letters to Kisra and Yemen's Leadership",      "East and South Receive the Call",          "campaigns", "The Prophet's ﷺ letter to Kisra, the Persian emperor — and his furious response. Then the remarkable conversion of Yemen's leadership that followed.", false),
  makePart(72, "The Prophetic Letter to Heraclius",            "Caesar Is Confronted with Islam",          "campaigns", "The detailed story of the Prophet's ﷺ letter to the Byzantine Emperor — Abu Sufyan's account of his encounter with Heraclius, and what the emperor knew but could not act on.", true),
  makePart(73, "Correspondence with al-Bahrayn",               "The Eastern Arabian Response",             "campaigns", "The invitation to the rulers of al-Bahrayn — and their acceptance of Islam, making them among the earliest regional leaders to enter the faith.", false),
  makePart(74, "Correspondence with Yamamah",                  "The Heart of Arabia Addressed",            "campaigns", "The Prophet's ﷺ letter to Hawdha ibn Ali of Yamamah — a proud leader who demanded political concessions in exchange for Islam — and the Prophet's response.", false),
  makePart(75, "The Letter to al-Harith al-Ghassani",          "Syria Hears the Call",                     "campaigns", "The invitation to the Ghassanid ruler in Syria — a client of Byzantium — and the confrontation it triggered, setting the stage for future northern expeditions.", false),
  makePart(76, "Prophetic Diplomacy: The Kings of Oman",       "The Sea Kingdom Receives the Message",     "campaigns", "The Prophet's ﷺ diplomatic outreach to Oman's rulers and the extraordinary response of a people on the edge of Arabia's eastern coast.", false),
  makePart(77, "The Dhu Qarad Expedition",                     "Defending Madinah's Outskirts",            "campaigns", "A raid on Madinah's grazing lands triggers a swift Muslim response — an expedition that demonstrates the Prophet's ﷺ vigilance in protecting the community's security.", false),
  makePart(78, "The Conquest of Khaybar",                      "The Fortresses Fall",                      "campaigns", "The Muslim army marches on the fortified Jewish strongholds of Khaybar. The role of Ali رضي الله عنه. The poisoned meat. The settlement that followed.", true),
  makePart(79, "The Khaybar Campaign: Strategic Analysis",     "A New Phase of Strength",                  "campaigns", "An analytical look at the Khaybar campaign — its strategic motivations, the military operations, and what the victory meant for the Muslim position in the Hijaz.", false),
  makePart(80, "Conquest of Khaybar: Aftermath and Legacy",    "What Khaybar Changed",                     "campaigns", "The consequences of Khaybar — the agricultural arrangements, the return of emigrants from Abyssinia, and the marriage of Safiyyah رضي الله عنها.", false),
  makePart(81, "Post-Coalition Military Campaigns",            "Clearing the Path to Makkah",              "campaigns", "The military operations that followed Khaybar — consolidating Muslim influence and removing remaining obstacles on the road to the conquest of Makkah.", false),
  makePart(82, "Northern Expeditions in the 8th Year AH",      "Setting the Stage for the Great Conquest", "campaigns", "The northern expeditions of the eighth year — including the engagement at Mu'tah — and how they revealed both Muslim resolve and the limits of their current reach.", false),

  // ── Final Years ───────────────────────────────────────────────────────────
  makePart(83, "The Road to the Conquest of Makkah",           "The Treaty Broken, the Time Has Come",     "final-years", "Quraysh breaks the Treaty of Hudaybiyah by attacking a Muslim-allied tribe. The Prophet ﷺ prepares in secret for the greatest campaign of his life.", true),
  makePart(84, "The Conquest of Makkah",                       "Twenty Years Come Full Circle",            "final-years", "Ten thousand Muslims march on the city that expelled them. The bloodless entry. The Prophet ﷺ at the Ka'bah. His announcement of general amnesty to those who had tormented him.", true),
  makePart(85, "The Battles of Hunayn and Ta'if",              "Pride Before the Fall, Mercy in Victory",  "final-years", "Days after the conquest, a new test. The confident Muslim army is ambushed at Hunayn. Their near-collapse. The rally. The siege of Ta'if and the wisdom of the Prophet ﷺ.", true),
  makePart(86, "The Distribution at al-Ji'ranah",              "Wisdom in Victory's Aftermath",            "final-years", "The distribution of Hunayn's spoils — the large gifts to newly-converted Qurayshi leaders, the discontent of the Ansar, and the Prophet's ﷺ profound address that silenced every grievance.", false),
  makePart(87, "Post-Hunayn: The Hawazin Delegation",          "Mercy and Forgiveness",                    "final-years", "The Hawazin tribe, defeated at Hunayn, sends a delegation to request the return of their captives. The Prophet's ﷺ response demonstrates the mercy at the heart of his character.", false),
  makePart(88, "Strategic Consolidation in the 9th Year AH",   "A Peninsula United Under Islam",           "final-years", "The ninth year after Hijrah — the 'Year of Delegations' begins. Arabia's political landscape transformed. How the Prophet ﷺ consolidated the Muslim state across the peninsula.", true),
  makePart(89, "The Tabuk Expedition: A Response to Byzantium","Marching North to the Frontier",           "final-years", "Amid extreme heat, the Prophet ﷺ calls for an expedition to the northern frontier against Byzantine power. The difficult mobilization and what it revealed about the Ummah.", true),
  makePart(90, "The Tabuk Expedition: Jaysh al-Usrah",         "The Army of Hardship",                     "final-years", "The conditions of the Tabuk expedition were brutal. Yet the believers went. This part examines the sacrifices, the hardships, and the examples of extraordinary faith on this march.", false),
  makePart(91, "The Tabuk Expedition: Consequences and Revelations", "What Tabuk Revealed",               "final-years", "The Tabuk expedition exposed the hypocrites definitively. The revelation of Surah al-Tawbah. The story of the three companions left behind. The enduring lessons.", true),
  makePart(92, "The Proclamation of Bara'ah",                  "The Ninth Year Hajj and the End of Shirk in Makkah", "final-years", "Abu Bakr leads the Hajj. Ali رضي الله عنه proclaims the verses of Bara'ah — a formal declaration that Makkah is now forever purified of polytheism.", true),
  makePart(93, "The Prophet's Military Campaigns: Leadership and Ethics", "A Legacy of Justice",          "final-years", "A comprehensive examination of the Prophet's ﷺ military leadership — the rules of engagement, the treatment of enemies, the protection of civilians, and the ethics of Islamic warfare.", true),
  makePart(94, "The Mass Embrace of Islam",                    "All of Arabia Enters the Faith",           "final-years", "The rapid and widespread acceptance of Islam following the Conquest of Makkah — how and why an entire peninsula transformed its religion within two years.", true),
  makePart(95, "The Year of Delegations",                      "The Tribes Come to Madinah",               "final-years", "Delegation after delegation arrives in Madinah from across Arabia. Their stories, their conversations with the Prophet ﷺ, and the diversity of paths that led people to Islam.", true),
  makePart(96, "The Impact and Legacy of the Islamic Call",    "A Mission That Reshaped the World",        "final-years", "A reflection on what the Prophetic mission achieved — the scale of transformation it produced in Arabia and beyond, and what made it historically singular.", false),
  makePart(97, "The Farewell Pilgrimage",                      "The Final Hajj of the Prophet ﷺ",         "final-years", "More than 100,000 Muslims gather for the Prophet's ﷺ only Hajj as Prophet. His Farewell Sermon. The verse completing the religion. The silent awareness that the end was near.", true),
  makePart(98, "The Expedition of Usamah ibn Zayd",            "A Final Command to His Companions",        "final-years", "While gravely ill, the Prophet ﷺ insists on the dispatch of Usamah's expedition. His companions' hesitation. His insistence. What this final command reveals about his character.", false),
  makePart(99, "The Final Days of the Prophet ﷺ",             "The Beloved Departs",                      "final-years", "The illness, the final visits to companions' graves, the last sermons, the death of the Prophet ﷺ in the lap of Aisha رضي الله عنها, and the Ummah's unimaginable grief.", true),
  makePart(100,"The Household of the Prophet ﷺ",              "Those He Left Behind",                     "final-years", "A final portrait of the Prophet's ﷺ wives, children, and closest family — who they were, what they meant to him, and the legacies they carried after his passing.", true),
];

export function getPartById(id: string): Part | undefined {
  return PARTS.find((p) => p.id === id);
}

export function getPartsByEra(era: Era): Part[] {
  return PARTS.filter((p) => p.era === era);
}

export function getEssentialsParts(): Part[] {
  return PARTS.filter((p) => p.includedInEssentials);
}

export function getPartsForPlan(_plan: "essentials" | "complete"): Part[] {
  return PARTS;
}

export function getEraGroups(): Array<{ era: EraInfo; parts: Part[] }> {
  return ERAS.map((eraInfo: EraInfo) => ({
    era: eraInfo,
    parts: getPartsByEra(eraInfo.id),
  })).filter((g: { parts: Part[] }) => g.parts.length > 0);
}
