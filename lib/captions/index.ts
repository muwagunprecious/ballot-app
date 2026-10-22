import { CaptionLanguage, CaptionTone, GeneratedCaption, LineupSelection } from '@/types/ballot';
import { getCandidateById } from '@/lib/data/candidates';
import { getStateByCode, getSenatorialDistrict, getFederalConstituency } from '@/lib/data/states';

interface CaptionParams {
  lineup: LineupSelection;
  language: CaptionLanguage;
  tone: CaptionTone;
}

export function generateCaption({ lineup, language, tone }: CaptionParams): GeneratedCaption {
  const state = getStateByCode(lineup.stateCode);
  const { district } = getSenatorialDistrict(lineup.stateCode, lineup.senatorialDistrictId);
  const { constituency } = getFederalConstituency(lineup.stateCode, lineup.federalConstituencyId);

  const pres = getCandidateById(lineup.presidentId);
  const gov = getCandidateById(lineup.governorId);
  const sen = getCandidateById(lineup.senatorId);
  const rep = getCandidateById(lineup.representativeId);

  const stateName = state?.name || 'Nigeria';
  const districtName = district?.name || 'Senatorial District';
  const constituencyName = constituency?.name || 'Federal Constituency';

  const presText = pres ? `${pres.name} (${pres.partyAcronym})` : 'Undecided';
  const govText = gov ? `${gov.name} (${gov.partyAcronym})` : 'Undecided';
  const senText = sen ? `${sen.name} (${sen.partyAcronym})` : 'Undecided';
  const repText = rep ? `${rep.name} (${rep.partyAcronym})` : 'Undecided';

  const hashtags = [
    '#my2027lineup',
    '#NigeriaDecides2027',
    `#${stateName.replace(/\s+/g, '')}Decides2027`,
    '#NaijaVotes',
  ];

  let text = '';

  // ENGLISH
  if (language === 'english') {
    switch (tone) {
      case 'direct':
        text = `My 2027 General Election Lineup for ${stateName}:\n\n🇳🇬 President: ${presText}\n🏛 Governor: ${govText}\n📜 Senator (${districtName}): ${senText}\n🏛 House of Reps (${constituencyName}): ${repText}\n\nStand for what you believe in. Build yours at www.2027lineup.com`;
        break;
      case 'community':
        text = `Power belongs to the citizens. As a proud resident of ${stateName}, here is my collective vision and candidate lineup for 2027.\n\n• President: ${presText}\n• Governor: ${govText}\n• Senator (${districtName}): ${senText}\n• Representative (${constituencyName}): ${repText}\n\nLet us organize, mobilize our neighborhoods, and hold every leader accountable for a better Nigeria.`;
        break;
      case 'civic':
        text = `Democracy thrives when citizens participate with clarity of purpose. After careful deliberation on capacity, competence, and national interest, here is my 2027 ballot lineup from ${constituencyName}, ${stateName}:\n\n1. Office of the President: ${presText}\n2. Executive Governor: ${govText}\n3. Senate of the Federal Republic: ${senText}\n4. House of Representatives: ${repText}\n\nVote your conscience. Exercise your civic duty.`;
        break;
      case 'conversational':
        text = `2027 is around the corner and we’re not taking a back seat! Here is where my votes are going in ${stateName}:\n\n🎯 President: ${presText}\n🎯 Governor: ${govText}\n🎯 Senate (${districtName}): ${senText}\n🎯 House of Reps (${constituencyName}): ${repText}\n\nWhat does your 2027 lineup look like? Create your card at www.2027lineup.com!`;
        break;
    }
  }

  // NIGERIAN PIDGIN
  else if (language === 'pidgin') {
    switch (tone) {
      case 'direct':
        text = `My 2027 Election Lineup don set for ${stateName}!\n\n🇳🇬 President: ${presText}\n🏛 Governor: ${govText}\n📜 Senator (${districtName}): ${senText}\n🏛 House of Reps (${constituencyName}): ${repText}\n\nNo dulling this time. Make you build your own ballot card for www.2027lineup.com`;
        break;
      case 'community':
        text = `Naija people, our voice na our power! From ${stateName}, na these people I believe say go represent us well for 2027:\n\n• President: ${presText}\n• Governor: ${govText}\n• Senator (${districtName}): ${senText}\n• House of Reps (${constituencyName}): ${repText}\n\nMake we join hand together make Nigeria sweet for everybody.`;
        break;
      case 'civic':
        text = `To vote right na our right and duty. After we don look all the plans well well for ${stateName}, see who I dey back for 2027:\n\n1. President: ${presText}\n2. Governor: ${govText}\n3. Senator: ${senText}\n4. House of Reps: ${repText}\n\nShine your eyes, no sell your vote. Build your card for www.2027lineup.com`;
        break;
      case 'conversational':
        text = `Who dey breath? My 2027 ballot card don drop hot hot! 🔥\n\n🎯 President: ${presText}\n🎯 Governor: ${govText}\n🎯 Senator (${districtName}): ${senText}\n🎯 House of Reps (${constituencyName}): ${repText}\n\nHow your own lineup be? Go generate your own now!`;
        break;
    }
  }

  // YORUBA
  else if (language === 'yoruba') {
    switch (tone) {
      case 'direct':
        text = `Àtòjọ olùdíje mi fún ìdìbò gbogbogbò 2027 ní Ìpínlẹ̀ ${stateName}:\n\n🇳🇬 Ààrẹ: ${presText}\n🏛 Gómìnà: ${govText}\n📜 Aṣojú Ilé Ìgbìmọ̀ Àgbà (${districtName}): ${senText}\n🏛 Aṣojú Ilé Ìgbìmọ̀ Aṣòfin (${constituencyName}): ${repText}\n\nṢe àtòjọ tìrẹ lónìí ní www.2027lineup.com`;
        break;
      case 'community':
        text = `Ìdàgbàsókè orílẹ̀-èdè wa wà lọ́wọ́ gbogbo wa. Lati Ìpínlẹ̀ ${stateName}, àwọn wọ̀nyí ni mo fọkàn tì fún 2027:\n\n• Ààrẹ: ${presText}\n• Gómìnà: ${govText}\n• Alàgbà Ìgbìmọ̀: ${senText}\n• Aṣòfin Àpapọ̀: ${repText}\n\nẸ jẹ́ ká fọwọ́ sowọ́pọ̀ fún ọjọ́ ọ̀la rere.`;
        break;
      case 'civic':
        text = `Ìlú tẹ́tẹ́ fẹ́ ìgbésẹ̀ tó dánmọ́ràn. Lẹ́yìn àyẹ̀wò fínnífínní lórí agbára àti ìmọ̀ ìṣàkóso ní ${stateName}:\n\n1. Ààrẹ Orílẹ̀-èdè: ${presText}\n2. Gómìnà Ìpínlẹ̀: ${govText}\n3. Ilé Ìgbìmọ̀ Àgbà: ${senText}\n4. Ilé Ìgbìmọ̀ Aṣòfin: ${repText}\n\nBọ̀wọ̀ fún ẹ̀tọ́ rẹ, dìbò pẹ̀lú ọpọlọ.`;
        break;
      case 'conversational':
        text = `Ètò ìdìbò 2027 ti ń bọ̀ lẹ́sẹ̀kẹsẹ̀! Èyí ni àwọn olùdíje tí mo yàn fún Ìpínlẹ̀ ${stateName}:\n\n🎯 Ààrẹ: ${presText}\n🎯 Gómìnà: ${govText}\n🎯 Alàgbà: ${senText}\n🎯 Aṣòfin: ${repText}\n\nTa ni ìwọ ń dìbò fún? Ṣẹ̀dá káàdì rẹ ní www.2027lineup.com!`;
        break;
    }
  }

  // HAUSA
  else if (language === 'hausa') {
    switch (tone) {
      case 'direct':
        text = `Jerin 'Yan Takara Na Na Zaben 2027 a Jihar ${stateName}:\n\n🇳🇬 Shugaban Kasa: ${presText}\n🏛 Gwamna: ${govText}\n📜 Sanata (${districtName}): ${senText}\n🏛 Dan Majalisar Wakilai (${constituencyName}): ${repText}\n\nKa kirkiri naka katin a www.2027lineup.com`;
        break;
      case 'community':
        text = `Makomar kasarmu tana hannunmu. Daga Jihar ${stateName}, ga jerin 'yan takarar da na zaba don ciyar da al'ummarmu gaba a 2027:\n\n• Shugaban Kasa: ${presText}\n• Gwamna: ${govText}\n• Sanata: ${senText}\n• Dan Majalisa: ${repText}\n\nMu hada kai don gina sabuwar Najeriya.`;
        break;
      case 'civic':
        text = `Zabe cikin basira da adalci shi ne ginshikin dimokuradiyya. Bayan nazari kan kwarewa a ${stateName}, ga shawarata don zaben 2027:\n\n1. Ofishin Shugaban Kasa: ${presText}\n2. Gwamnan Jiha: ${govText}\n3. Majalisar Dattawa: ${senText}\n4. Majalisar Wakilai: ${repText}\n\nYi amfani da 'yancin ka cikin hikima.`;
        break;
      case 'conversational':
        text = `Zaben 2027 na gabatowa! Ga jerin 'yan takarar da nake mara wa baya a Jihar ${stateName}:\n\n🎯 Shugaban Kasa: ${presText}\n🎯 Gwamna: ${govText}\n🎯 Sanata (${districtName}): ${senText}\n🎯 Dan Majalisa: ${repText}\n\nWane ne a cikin jerin ka? Shiga www.2027lineup.com don yin naka!`;
        break;
    }
  }

  // IGBO
  else if (language === 'igbo') {
    switch (tone) {
      case 'direct':
        text = `Ndị m họọrọ maka ntuli aka 2027 na Steeti ${stateName}:\n\n🇳🇬 Onye Isi Ala: ${presText}\n🏛 Gọvanọ: ${govText}\n📜 Sịnetọ (${districtName}): ${senText}\n🏛 Ụlọ Ndị Nnọchiteanya (${constituencyName}): ${repText}\n\nMee nke gị na www.2027lineup.com`;
        break;
      case 'community':
        text = `Ọdịmma obodo anyị dị anyị n'aka. Site na Steeti ${stateName}, ndị a bụ ndị m kwenyere na ha ga-arụ ọrụ nke ọma na 2027:\n\n• Onye Isi Ala: ${presText}\n• Gọvanọ: ${govText}\n• Sịnetọ: ${senText}\n• Onye Nnọchiteanya: ${repText}\n\nKa anyị jikọọ aka ọnụ mee ka Naijiria dị mma.`;
        break;
      case 'civic':
        text = `Ntuli aka dabeere n'ezi uche na nghọta bụ ihe na-ewu obodo. Mgbe m tụlechara ikike na atụmatụ na ${stateName}:\n\n1. Onye Isi Ala: ${presText}\n2. Gọvanọ: ${govText}\n3. Sịneti: ${senText}\n4. Ụlọ Ndị Nnọchiteanya: ${repText}\n\nHọrọ onye ị maara nke ọma. Duru uche gị mee mkpebi.`;
        break;
      case 'conversational':
        text = `Ntuli aka 2027 eruola nso! Lee ndị m na-akwado na Steeti ${stateName}:\n\n🎯 Onye Isi Ala: ${presText}\n🎯 Gọvanọ: ${govText}\n🎯 Sịnetọ: ${senText}\n🎯 Onye Nnọchiteanya: ${repText}\n\nKedu ka nke gị dị? Gaa na www.2027lineup.com mepụta kaadị nke gị ugbu a!`;
        break;
    }
  }

  return {
    language,
    tone,
    text: text.trim(),
    hashtags,
  };
}
