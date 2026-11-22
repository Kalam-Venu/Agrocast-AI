// Districts 15 to 20: NTR, Palnadu, Parvathipuram Manyam, Prakasam, Sri Potti Sriramulu Nellore, Sri Sathya Sai

module.exports = [
  {
    id: 'ntr',
    name: 'NTR',
    nameTe: 'ఎన్టీఆర్',
    lgdCode: 750,
    hq: 'Vijayawada',
    latitude: 16.5062,
    longitude: 80.6480,
    dominantSoil: 'alluvial_and_black',
    soilDescTe: 'కృష్ణా నదీ పరీవాహక ఒండ్రు నేలలు మరియు సారవంతమైన నల్ల రేగడి నేలలు (వాణిజ్య & వ్యవసాయ రాజధాని)',
    soilDescEn: 'Krishna river basin alluvial loams and fertile black cotton soils',
    commonCrops: ['Paddy', 'Cotton', 'Chilli', 'Sugarcane', 'Mango', 'Banana'],
    commonCropsTe: ['వరి', 'పత్తి', 'మిరప', 'చెరకు', 'మామిడి', 'అరటి'],
    mandals: [
      { id: 'vijayawada_central', name: 'Vijayawada Central', nameTe: 'విజయవాడ సెంట్రల్', lgdCode: 5120, lat: 16.51, lon: 80.65, villages: [
        { name: 'Governorpet', nameTe: 'గవర్నర్‌పేట', lat: 16.51, lon: 80.65 },
        { name: 'Satyanarayanapuram', nameTe: 'సత్యనారాయణపురం', lat: 16.52, lon: 80.64 }
      ]},
      { id: 'vijayawada_east', name: 'Vijayawada East', nameTe: 'విజయవాడ తూర్పు', lgdCode: 5121, lat: 16.50, lon: 80.67, villages: [
        { name: 'Patamata', nameTe: 'పటమట', lat: 16.50, lon: 80.67 },
        { name: 'Benz Circle Area', nameTe: 'బెంజ్ సర్కిల్', lat: 16.49, lon: 80.66 }
      ]},
      { id: 'vijayawada_west', name: 'Vijayawada West', nameTe: 'విజయవాడ పశ్చిమ', lgdCode: 5122, lat: 16.52, lon: 80.61, villages: [
        { name: 'Kanaka Durga Temple Area', nameTe: 'ఇంద్రకీలాద్రి కనకదుర్గ క్షేత్రం', lat: 16.52, lon: 80.61 },
        { name: 'Bhavanipuram', nameTe: 'భవానిపురం', lat: 16.53, lon: 80.60 }
      ]},
      { id: 'vijayawada_north', name: 'Vijayawada North', nameTe: 'విజయవాడ ఉత్తర', lgdCode: 5123, lat: 16.55, lon: 80.64, villages: [
        { name: 'Gunadala (Mary Matha Shrine)', nameTe: 'గుణదల మేరీమాత క్షేత్రం', lat: 16.55, lon: 80.64 },
        { name: 'Prasadampadu', nameTe: 'ప్రసాదంపాడు', lat: 16.53, lon: 80.68 }
      ]},
      { id: 'vijayawada_rural', name: 'Vijayawada Rural', nameTe: 'విజయవాడ రూరల్', lgdCode: 5124, lat: 16.56, lon: 80.67, villages: [
        { name: 'Enikepadu', nameTe: 'ఎనికేపాడు', lat: 16.54, lon: 80.69 },
        { name: 'Nunna (Asia Famous Mango Market)', nameTe: 'నున్న (మామిడి మార్కెట్ యార్డ్)', lat: 16.58, lon: 80.67 },
        { name: 'Gollapudi Agri Market', nameTe: 'గొల్లపూడి మార్కెట్ యార్డ్', lat: 16.54, lon: 80.59 }
      ]},
      { id: 'ibrahimpatnam', name: 'Ibrahimpatnam', nameTe: 'ఇబ్రహీంపట్నం', lgdCode: 5125, lat: 16.58, lon: 80.52, villages: [
        { name: 'Ibrahimpatnam (Dr. NTTPS Thermal Power)', nameTe: 'ఇబ్రహీంపట్నం థర్మల్ పవర్', lat: 16.58, lon: 80.52 },
        { name: 'Kondapalli (Wooden Toys & Fort)', nameTe: 'కొండపల్లి బొమ్మల గ్రామం', lat: 16.62, lon: 80.54 },
        { name: 'Ferry Confluence', nameTe: 'ఫెర్రీ పవిత్ర సంగమం', lat: 16.57, lon: 80.50 }
      ]},
      { id: 'mylavaram', name: 'Mylavaram', nameTe: 'మైలవరం', lgdCode: 5126, lat: 16.76, lon: 80.64, villages: [
        { name: 'Mylavaram Town', nameTe: 'మైలవరం టౌన్', lat: 16.76, lon: 80.64 },
        { name: 'Chandrala', nameTe: 'చంద్రాల', lat: 16.78, lon: 80.62 },
        { name: 'Pulluru', nameTe: 'పుల్లూరు', lat: 16.74, lon: 80.66 }
      ]},
      { id: 'g_konduru', name: 'G.Konduru', nameTe: 'జి.కొండూరు', lgdCode: 5127, lat: 16.69, lon: 80.56, villages: [
        { name: 'G.Konduru HQ', nameTe: 'జి.కొండూరు', lat: 16.69, lon: 80.56 }
      ]},
      { id: 'reddigudem', name: 'Reddigudem', nameTe: 'రెడ్డిగూడెం', lgdCode: 5128, lat: 16.85, lon: 80.70, villages: [
        { name: 'Reddigudem HQ', nameTe: 'రెడ్డిగూడెం', lat: 16.85, lon: 80.70 }
      ]},
      { id: 'tiruvuru', name: 'Tiruvuru', nameTe: 'తిరువూరు', lgdCode: 5129, lat: 17.11, lon: 80.61, villages: [
        { name: 'Tiruvuru Town (Border Agricultural Trading)', nameTe: 'తిరువూరు టౌన్', lat: 17.11, lon: 80.61 },
        { name: 'Kokilampadu', nameTe: 'కోకిలంపాడు', lat: 17.13, lon: 80.59 }
      ]},
      { id: 'a_konduru', name: 'A.Konduru', nameTe: 'ఎ.కొండూరు', lgdCode: 5130, lat: 17.03, lon: 80.69, villages: [
        { name: 'A.Konduru HQ', nameTe: 'ఎ.కొండూరు', lat: 17.03, lon: 80.69 }
      ]},
      { id: 'gampalagudem', name: 'Gampalagudem', nameTe: 'గంపాorganగూడెం', lgdCode: 5131, lat: 17.01, lon: 80.52, villages: [
        { name: 'Gampalagudem HQ', nameTe: 'గంపాorganగూడెం', lat: 17.01, lon: 80.52 }
      ]},
      { id: 'vissannapeta', name: 'Vissannapeta', nameTe: 'విస్సన్నపేట', lgdCode: 5132, lat: 16.92, lon: 80.76, villages: [
        { name: 'Vissannapeta (Mango Trading Hub)', nameTe: 'విస్సన్నపేట మామిడి మార్కెట్', lat: 16.92, lon: 80.76 }
      ]},
      { id: 'nandigama', name: 'Nandigama', nameTe: 'నందిగామ', lgdCode: 5133, lat: 16.78, lon: 80.30, villages: [
        { name: 'Nandigama Commercial Town', nameTe: 'నందిగామ టౌన్', lat: 16.78, lon: 80.30 },
        { name: 'Adiviravulapadu', nameTe: 'అడవిరావులపాడు', lat: 16.76, lon: 80.32 },
        { name: 'Munagacherla', nameTe: 'మునగచర్ల', lat: 16.80, lon: 80.28 }
      ]},
      { id: 'kanchikacherla', name: 'Kanchikacherla', nameTe: 'కంచికచర్ల', lgdCode: 5134, lat: 16.68, lon: 80.39, villages: [
        { name: 'Kanchikacherla HQ', nameTe: 'కంచికచర్ల', lat: 16.68, lon: 80.39 },
        { name: 'Paritala', nameTe: 'పరిటాల', lat: 16.65, lon: 80.41 }
      ]},
      { id: 'veerullapadu', name: 'Veerullapadu', nameTe: 'వీరుళ్లపాడు', lgdCode: 5135, lat: 16.84, lon: 80.41, villages: [
        { name: 'Veerullapadu HQ', nameTe: 'వీరుళ్లపాడు', lat: 16.84, lon: 80.41 }
      ]},
      { id: 'chandarlapadu', name: 'Chandarlapadu', nameTe: 'చందర్లపాడు', lgdCode: 5136, lat: 16.70, lon: 80.20, villages: [
        { name: 'Chandarlapadu HQ', nameTe: 'చందర్లపాడు', lat: 16.70, lon: 80.20 }
      ]},
      { id: 'jaggayyapeta', name: 'Jaggayyapeta', nameTe: 'జగ్గయ్యపేట', lgdCode: 5137, lat: 16.89, lon: 80.10, villages: [
        { name: 'Jaggayyapeta (Cement Capital of AP)', nameTe: 'జగ్గయ్యపేట (సిమెంట్ పరిశ్రమల హబ్)', lat: 16.89, lon: 80.10 },
        { name: 'Muktyala (Muktyala Koti Lingala)', nameTe: 'ముక్త్యాల క్షేత్రం', lat: 16.84, lon: 80.13 },
        { name: 'Chillakallu Toll Junction', nameTe: 'చిల్లకల్లు', lat: 16.88, lon: 80.15 }
      ]},
      { id: 'vatsavai', name: 'Vatsavai', nameTe: 'వత్సవాయి', lgdCode: 5138, lat: 17.02, lon: 80.15, villages: [
        { name: 'Vatsavai HQ', nameTe: 'వత్సవాయి', lat: 17.02, lon: 80.15 }
      ]},
      { id: 'penuganchiprolu', name: 'Penuganchiprolu', nameTe: 'పెనుగంచిప్రోలు', lgdCode: 5139, lat: 16.92, lon: 80.24, villages: [
        { name: 'Penuganchiprolu (Tirupatamma Temple)', nameTe: 'పెనుగంచిప్రోలు తిరుపతమ్మ క్షేత్రం', lat: 16.92, lon: 80.24 }
      ]}
    ]
  },
  {
    id: 'palnadu',
    name: 'Palnadu',
    nameTe: 'పల్నాడు',
    lgdCode: 752,
    hq: 'Narasaraopet',
    latitude: 16.2361,
    longitude: 80.0543,
    dominantSoil: 'black_cotton',
    soilDescTe: 'లోతైన నల్ల రేగడి మరియు రాతి మొరం నేలలు (మిరప, పత్తి, సున్నపురాయి పరిశ్రమలు)',
    soilDescEn: 'Deep black cotton soils, calcareous loams and limestone belts',
    commonCrops: ['Chilli', 'Cotton', 'Paddy', 'Tobacco', 'Red Gram', 'Maize'],
    commonCropsTe: ['మిరప', 'పత్తి', 'వరి', 'పొగాకు', 'కందులు', 'మొక్కజొన్న'],
    mandals: [
      { id: 'narasaraopet', name: 'Narasaraopet', nameTe: 'నరసరావుపేట', lgdCode: 5140, lat: 16.24, lon: 80.05, villages: [
        { name: 'Narasaraopet Town (Kotappakonda Foot)', nameTe: 'నరసరావుపేట టౌన్', lat: 16.24, lon: 80.05 },
        { name: 'Kotappakonda (Trikoteswara Swamy)', nameTe: 'కోటప్పకొండ క్షేత్రం', lat: 16.19, lon: 80.03 },
        { name: 'Kesanupalli', nameTe: 'కేసనుపల్లి', lat: 16.26, lon: 80.07 },
        { name: 'Palapadu', nameTe: 'పాలపాడు', lat: 16.21, lon: 80.08 }
      ]},
      { id: 'rompicherla_pln', name: 'Rompicherla (Palnadu)', nameTe: 'రొంపిచెర్ల', lgdCode: 5141, lat: 16.19, lon: 79.91, villages: [
        { name: 'Rompicherla HQ', nameTe: 'రొంపిచెర్ల', lat: 16.19, lon: 79.91 }
      ]},
      { id: 'chilakaluripet', name: 'Chilakaluripet', nameTe: 'చిలకలూరిపేట', lgdCode: 5142, lat: 16.09, lon: 80.17, villages: [
        { name: 'Chilakaluripet (Chilli & Cotton Mandi)', nameTe: 'చిలకలూరిపేట మార్కెట్ యార్డ్', lat: 16.09, lon: 80.17 },
        { name: 'Purushothapatnam', nameTe: 'పురుషోత్తపట్నం', lat: 16.11, lon: 80.15 },
        { name: 'Ganapavaram Pln', nameTe: 'గణపవరం', lat: 16.07, lon: 80.19 }
      ]},
      { id: 'nadendla', name: 'Nadendla', nameTe: 'నాదెండ్ల', lgdCode: 5143, lat: 16.14, lon: 80.12, villages: [
        { name: 'Nadendla HQ', nameTe: 'నాదెండ్ల', lat: 16.14, lon: 80.12 }
      ]},
      { id: 'edlapadu', name: 'Edlapadu', nameTe: 'ఎడ్లపాడు', lgdCode: 5144, lat: 16.14, lon: 80.24, villages: [
        { name: 'Edlapadu HQ', nameTe: 'ఎడ్లపాడు', lat: 16.14, lon: 80.24 }
      ]},
      { id: 'sattenapalle', name: 'Sattenapalle', nameTe: 'సత్తెనపల్లి', lgdCode: 5145, lat: 16.40, lon: 80.15, villages: [
        { name: 'Sattenapalle Commercial Hub', nameTe: 'సత్తెనపల్లి టౌన్', lat: 16.40, lon: 80.15 },
        { name: 'Dhulipalla', nameTe: 'ధూళిపాళ్ల', lat: 16.42, lon: 80.13 },
        { name: 'Kandlagunta', nameTe: 'కండ్లకుంట', lat: 16.38, lon: 80.17 }
      ]},
      { id: 'rajupalem_pln', name: 'Rajupalem', nameTe: 'రాజుపాలెం', lgdCode: 5146, lat: 16.46, lon: 80.06, villages: [
        { name: 'Rajupalem HQ', nameTe: 'రాజుపాలెం', lat: 16.46, lon: 80.06 }
      ]},
      { id: 'nekarikallu', name: 'Nekarikallu', nameTe: 'నెకరికల్లు', lgdCode: 5147, lat: 16.32, lon: 79.99, villages: [
        { name: 'Nekarikallu HQ', nameTe: 'నెకరికల్లు', lat: 16.32, lon: 79.99 }
      ]},
      { id: 'muppalla', name: 'Muppalla', nameTe: 'ముప్పాళ్ల', lgdCode: 5148, lat: 16.35, lon: 80.09, villages: [
        { name: 'Muppalla HQ', nameTe: 'ముప్పాళ్ల', lat: 16.35, lon: 80.09 }
      ]},
      { id: 'pedakurapadu', name: 'Pedakurapadu', nameTe: 'పెదకూరపాడు', lgdCode: 5149, lat: 16.49, lon: 80.26, villages: [
        { name: 'Pedakurapadu HQ', nameTe: 'పెదకూరపాడు', lat: 16.49, lon: 80.26 },
        { name: 'Hussainnagaram', nameTe: 'హుస్సేన్‌నగరం', lat: 16.51, lon: 80.24 }
      ]},
      { id: 'bellamkonda', name: 'Bellamkonda', nameTe: 'బెల్లంకొండ', lgdCode: 5150, lat: 16.51, lon: 80.06, villages: [
        { name: 'Bellamkonda Fort', nameTe: 'బెల్లంకొండ చారిత్రక కోట', lat: 16.51, lon: 80.06 }
      ]},
      { id: 'atchampet_pln', name: 'Atchampet', nameTe: 'అచ్చంపేట', lgdCode: 5151, lat: 16.65, lon: 80.16, villages: [
        { name: 'Atchampet HQ', nameTe: 'అచ్చంపేట', lat: 16.65, lon: 80.16 }
      ]},
      { id: 'krosuru', name: 'Krosuru', nameTe: 'క్రోసూరు', lgdCode: 5152, lat: 16.55, lon: 80.15, villages: [
        { name: 'Krosuru HQ', nameTe: 'క్రోసూరు', lat: 16.55, lon: 80.15 }
      ]},
      { id: 'amaravathi_town', name: 'Amaravathi', nameTe: 'అమరావతి', lgdCode: 5153, lat: 16.57, lon: 80.36, villages: [
        { name: 'Amaravathi (Amareswara Swamy & Maha Stupa)', nameTe: 'అమరావతి పంచారామ క్షేత్రం', lat: 16.57, lon: 80.36 },
        { name: 'Dharanikota', nameTe: 'ధరణికోట', lat: 16.56, lon: 80.34 }
      ]},
      { id: 'vinukonda', name: 'Vinukonda', nameTe: 'వినుకొండ', lgdCode: 5154, lat: 16.05, lon: 79.74, villages: [
        { name: 'Vinukonda Town (Historic Hill Fort)', nameTe: 'వినుకొండ టౌన్', lat: 16.05, lon: 79.74 },
        { name: 'Nuzendla Road Vill', nameTe: 'నూజెండ్ల రోడ్డు', lat: 16.07, lon: 79.72 }
      ]},
      { id: 'nuzendla', name: 'Nuzendla', nameTe: 'నూజెండ్ల', lgdCode: 5155, lat: 15.98, lon: 79.82, villages: [
        { name: 'Nuzendla HQ', nameTe: 'నూజెండ్ల', lat: 15.98, lon: 79.82 }
      ]},
      { id: 'savalyapuram', name: 'Savalyapuram', nameTe: 'సావల్యాపురం', lgdCode: 5156, lat: 16.12, lon: 79.86, villages: [
        { name: 'Savalyapuram HQ', nameTe: 'సావల్యాపురం', lat: 16.12, lon: 79.86 }
      ]},
      { id: 'ipur', name: 'Ipur', nameTe: 'ఈపూరు', lgdCode: 5157, lat: 16.20, lon: 79.76, villages: [
        { name: 'Ipur HQ', nameTe: 'ఈపూరు', lat: 16.20, lon: 79.76 }
      ]},
      { id: 'bollapalli', name: 'Bollapalli', nameTe: 'బొల్లాపల్లి', lgdCode: 5158, lat: 16.13, lon: 79.67, villages: [
        { name: 'Bollapalli HQ', nameTe: 'బొల్లాపల్లి', lat: 16.13, lon: 79.67 }
      ]},
      { id: 'gurazala', name: 'Gurazala', nameTe: 'గురజాల', lgdCode: 5159, lat: 16.58, lon: 79.57, villages: [
        { name: 'Gurazala (Palnadu Battle Ground)', nameTe: 'గురజాల వీరుల క్షేత్రం', lat: 16.58, lon: 79.57 },
        { name: 'Janapadu', nameTe: 'జానపాడు', lat: 16.60, lon: 79.55 }
      ]},
      { id: 'dachepalli', name: 'Dachepalli', nameTe: 'దాచేపల్లి', lgdCode: 5160, lat: 16.60, lon: 79.73, villages: [
        { name: 'Dachepalli Limestone Hub', nameTe: 'దాచేపల్లి', lat: 16.60, lon: 79.73 }
      ]},
      { id: 'piduguralla', name: 'Piduguralla', nameTe: 'పిడుగురాళ్ల', lgdCode: 5161, lat: 16.48, lon: 79.89, villages: [
        { name: 'Piduguralla (Lime City of AP)', nameTe: 'పిడుగురాళ్ల (సున్నపురాయి నగరం)', lat: 16.48, lon: 79.89 },
        { name: 'Karampudi Road Vill', nameTe: 'కారెంపూడి రోడ్డు', lat: 16.46, lon: 79.91 }
      ]},
      { id: 'machavaram_pln', name: 'Machavaram', nameTe: 'మాచవరం', lgdCode: 5162, lat: 16.57, lon: 79.87, villages: [
        { name: 'Machavaram HQ', nameTe: 'మాచవరం', lat: 16.57, lon: 79.87 }
      ]},
      { id: 'macherla', name: 'Macherla', nameTe: 'మాచర్ల', lgdCode: 5163, lat: 16.48, lon: 79.43, villages: [
        { name: 'Macherla (Chennakesava Swamy Temple)', nameTe: 'మాచర్ల చెన్నకేశవ క్షేత్రం', lat: 16.48, lon: 79.43 },
        { name: 'Nagarjuna Sagar Dam View Point', nameTe: 'నాగార్జున సాగర్ డ్యామ్ ప్రాంతం', lat: 16.58, lon: 79.31 },
        { name: 'Anupu (Reconstructed Buddhist Site)', nameTe: 'అనుపు బౌద్ధ కేంద్రం', lat: 16.54, lon: 79.33 }
      ]},
      { id: 'veldurthi_pln', name: 'Veldurthi (Palnadu)', nameTe: 'వెల్దుర్తి', lgdCode: 5164, lat: 16.36, lon: 79.34, villages: [
        { name: 'Veldurthi HQ', nameTe: 'వెల్దుర్తి', lat: 16.36, lon: 79.34 }
      ]},
      { id: 'durgi', name: 'Durgi', nameTe: 'దుర్గి', lgdCode: 5165, lat: 16.43, lon: 79.52, villages: [
        { name: 'Durgi Stone Sculpting Village', nameTe: 'దుర్గి శిల్పకళా గ్రామం', lat: 16.43, lon: 79.52 }
      ]},
      { id: 'rentachintala', name: 'Rentachintala', nameTe: 'రెంటచింతల', lgdCode: 5166, lat: 16.55, lon: 79.55, villages: [
        { name: 'Rentachintala (IMD Weather Station)', nameTe: 'రెంటచింతల (వాతావరణ కేంద్రం)', lat: 16.55, lon: 79.55 }
      ]},
      { id: 'karampudi', name: 'Karampudi', nameTe: 'కారెంపూడి', lgdCode: 5167, lat: 16.43, lon: 79.72, villages: [
        { name: 'Karampudi (Palnati Yuddham Arena)', nameTe: 'కారెంపూడి (పల్నాటి వీరుల గుడి)', lat: 16.43, lon: 79.72 }
      ]}
    ]
  },
  {
    id: 'parvathipuram_manyam',
    name: 'Parvathipuram Manyam',
    nameTe: 'పార్వతీపురం మన్యం',
    lgdCode: 744,
    hq: 'Parvathipuram',
    latitude: 18.7779,
    longitude: 83.4283,
    dominantSoil: 'red_laterite',
    soilDescTe: 'కొండ ప్రాంత ఎర్ర నేలలు మరియు నాగావళి/సువర్ణముఖి నదీ ఒండ్రు నేలలు (జీడిమామిడి, చిరుధాన్యాలు)',
    soilDescEn: 'Red lateritic soils and fertile river valley loams',
    commonCrops: ['Paddy', 'Cashew', 'Millets', 'Sugarcane', 'Cotton', 'Maize'],
    commonCropsTe: ['వరి', 'జీడిమామిడి', 'చిరుధాన్యాలు', 'చెరకు', 'పత్తి', 'మొక్కజొన్న'],
    mandals: [
      { id: 'parvathipuram_mandal', name: 'Parvathipuram', nameTe: 'పార్వతీపురం', lgdCode: 4801, lat: 18.78, lon: 83.43, villages: [
        { name: 'Parvathipuram Town', nameTe: 'పార్వతీపురం టౌన్', lat: 18.78, lon: 83.43 },
        { name: 'Mruthunjayanagaram', nameTe: 'మృత్యుంజయ నగరం', lat: 18.80, lon: 83.41 },
        { name: 'Dokiseela', nameTe: 'డోకిశీల', lat: 18.75, lon: 83.45 }
      ]},
      { id: 'seethanagaram_pvm', name: 'Seethanagaram (Manyam)', nameTe: 'సీతానగరం', lgdCode: 4802, lat: 18.67, lon: 83.38, villages: [
        { name: 'Seethanagaram Sugars', nameTe: 'సీతానగరం', lat: 18.67, lon: 83.38 },
        { name: 'Lachhirajupeta', nameTe: 'లచ్చిరాజుపేట', lat: 18.69, lon: 83.36 }
      ]},
      { id: 'balijipeta', name: 'Balijipeta', nameTe: 'బలిజిపేట', lgdCode: 4803, lat: 18.64, lon: 83.51, villages: [
        { name: 'Balijipeta (Venkateswara Swamy)', nameTe: 'బలిజిపేట', lat: 18.64, lon: 83.51 }
      ]},
      { id: 'salur', name: 'Salur', nameTe: 'సాలూరు', lgdCode: 4804, lat: 18.52, lon: 83.21, villages: [
        { name: 'Salur Town', nameTe: 'సాలూరు టౌన్', lat: 18.52, lon: 83.21 },
        { name: 'Borahabhadra', nameTe: 'బొరహభద్ర', lat: 18.55, lon: 83.19 },
        { name: 'Duggeru', nameTe: 'దుగ్గేరు', lat: 18.50, lon: 83.23 }
      ]},
      { id: 'pachipenta', name: 'Pachipenta', nameTe: 'పాచిపెంట', lgdCode: 4805, lat: 18.47, lon: 83.12, villages: [
        { name: 'Pachipenta HQ', nameTe: 'పాచిపెంట', lat: 18.47, lon: 83.12 }
      ]},
      { id: 'makkuva', name: 'Makkuva', nameTe: 'మక్కువ', lgdCode: 4806, lat: 18.68, lon: 83.27, villages: [
        { name: 'Makkuva HQ', nameTe: 'మక్కువ', lat: 18.68, lon: 83.27 },
        { name: 'Sambara (Polamamba Temple)', nameTe: 'సాంబర పోలమాంబ క్షేత్రం', lat: 18.65, lon: 83.29 }
      ]},
      { id: 'komarada', name: 'Komarada', nameTe: 'కొమరాడ', lgdCode: 4807, lat: 18.89, lon: 83.47, villages: [
        { name: 'Komarada HQ', nameTe: 'కొమరాడ', lat: 18.89, lon: 83.47 }
      ]},
      { id: 'gummalaxmipuram', name: 'Gummalaxmipuram', nameTe: 'గుమ్మలక్ష్మీపురం', lgdCode: 4808, lat: 18.98, lon: 83.63, villages: [
        { name: 'Gummalaxmipuram Tribal HQ', nameTe: 'గుమ్మలక్ష్మీపురం', lat: 18.98, lon: 83.63 },
        { name: 'Bhadrarajupeta', nameTe: 'భద్రరాజుపేట', lat: 18.96, lon: 83.65 }
      ]},
      { id: 'kurupam', name: 'Kurupam', nameTe: 'కురుపాం', lgdCode: 4809, lat: 18.87, lon: 83.56, villages: [
        { name: 'Kurupam Town', nameTe: 'కురుపాం టౌన్', lat: 18.87, lon: 83.56 },
        { name: 'Neelakantapuram', nameTe: 'నీలకంఠాపురం', lat: 18.85, lon: 83.58 }
      ]},
      { id: 'jiyyammavalasa', name: 'Jiyyammavalasa', nameTe: 'జియ్యమ్మవలస', lgdCode: 4810, lat: 18.77, lon: 83.54, villages: [
        { name: 'Jiyyammavalasa HQ', nameTe: 'జియ్యమ్మవలస', lat: 18.77, lon: 83.54 }
      ]},
      { id: 'garugubilli', name: 'Garugubilli', nameTe: 'గరుగుబిల్లి', lgdCode: 4811, lat: 18.72, lon: 83.48, villages: [
        { name: 'Garugubilli HQ', nameTe: 'గరుగుబిల్లి', lat: 18.72, lon: 83.48 },
        { name: 'Thotapalli Barrage Area', nameTe: 'తోటపల్లి బ్యారేజ్ ప్రాజెక్ట్', lat: 18.75, lon: 83.49 }
      ]},
      { id: 'palakonda', name: 'Palakonda', nameTe: 'పాలకొండ', lgdCode: 4812, lat: 18.60, lon: 83.76, villages: [
        { name: 'Palakonda Town (Kota Durgamma Temple)', nameTe: 'పాలకొండ టౌన్', lat: 18.60, lon: 83.76 },
        { name: 'Neelanagaram', nameTe: 'నీలనగరం', lat: 18.58, lon: 83.78 }
      ]},
      { id: 'seethampeta', name: 'Seethampeta', nameTe: 'సీతంపేట', lgdCode: 4813, lat: 18.67, lon: 83.85, villages: [
        { name: 'Seethampeta ITDA HQ', nameTe: 'సీతంపేట ఐటీడీఏ కేంద్రం', lat: 18.67, lon: 83.85 },
        { name: 'Mettuguda Waterfalls', nameTe: 'మెట్టుగూడ', lat: 18.70, lon: 83.88 }
      ]},
      { id: 'veeraghattam', name: 'Veeraghattam', nameTe: 'వీరఘట్టం', lgdCode: 4814, lat: 18.69, lon: 83.61, villages: [
        { name: 'Veeraghattam HQ', nameTe: 'వీరఘట్టం', lat: 18.69, lon: 83.61 }
      ]},
      { id: 'bhamini', name: 'Bhamini', nameTe: 'భామిని', lgdCode: 4815, lat: 18.82, lon: 83.79, villages: [
        { name: 'Bhamini HQ (Vamsadhara River Basin)', nameTe: 'భామిని', lat: 18.82, lon: 83.79 }
      ]}
    ]
  },
  {
    id: 'prakasam',
    name: 'Prakasam',
    nameTe: 'ప్రకాశం',
    lgdCode: 517,
    hq: 'Ongole',
    latitude: 15.5057,
    longitude: 80.0499,
    dominantSoil: 'red_sandy_and_black',
    soilDescTe: 'ఎర్ర ఇసుక నేలలు మరియు నల్ల రేగడి నేలలు (ఒంగోలు జాతి గిత్తలు & వర్జీనియా పొగాకు)',
    soilDescEn: 'Red sandy loams, black cotton soils and coastal gravels',
    commonCrops: ['Tobacco (FCV)', 'Cotton', 'Bengal Gram', 'Chilli', 'Groundnut', 'Paddy'],
    commonCropsTe: ['పొగాకు', 'పత్తి', 'శనగలు', 'మిరప', 'వేరుశనగ', 'వరి'],
    mandals: [
      { id: 'ongole_urban', name: 'Ongole Urban', nameTe: 'ఒంగోలు అర్బన్', lgdCode: 5071, lat: 15.51, lon: 80.05, villages: [
        { name: 'Ongole City (Ongole Bull Heritage)', nameTe: 'ఒంగోలు నగరం', lat: 15.51, lon: 80.05 },
        { name: 'Pernamitta', nameTe: 'పేర్నమిట్ట', lat: 15.49, lon: 80.02 }
      ]},
      { id: 'ongole_rural', name: 'Ongole Rural', nameTe: 'ఒంగోలు రూరల్', lgdCode: 5072, lat: 15.48, lon: 80.08, villages: [
        { name: 'Karavadi', nameTe: 'కరవది', lat: 15.46, lon: 80.11 },
        { name: 'Kothapatnam Road Vill', nameTe: 'కొత్తపట్నం రోడ్డు', lat: 15.47, lon: 80.06 }
      ]},
      { id: 'kothapatnam', name: 'Kothapatnam', nameTe: 'కొత్తపట్నం', lgdCode: 5073, lat: 15.45, lon: 80.19, villages: [
        { name: 'Kothapatnam Beach HQ', nameTe: 'కొత్తపట్నం బీచ్', lat: 15.45, lon: 80.19 }
      ]},
      { id: 'santhanuthalapadu', name: 'Santhanuthalapadu', nameTe: 'సంతనూతలపాడు', lgdCode: 5074, lat: 15.58, lon: 79.98, villages: [
        { name: 'Santhanuthalapadu HQ', nameTe: 'సంతనూతలపాడు', lat: 15.58, lon: 79.98 },
        { name: 'Maddipadu Border', nameTe: 'మద్దిపాడు సరిహద్దు', lat: 15.60, lon: 79.95 }
      ]},
      { id: 'maddipadu', name: 'Maddipadu', nameTe: 'మద్దిపాడు', lgdCode: 5075, lat: 15.62, lon: 80.02, villages: [
        { name: 'Maddipadu HQ', nameTe: 'మద్దిపాడు', lat: 15.62, lon: 80.02 }
      ]},
      { id: 'chimakurthi', name: 'Chimakurthi', nameTe: 'చీమకుర్తి', lgdCode: 5076, lat: 15.58, lon: 79.87, villages: [
        { name: 'Chimakurthi (World Galaxy Black Granite)', nameTe: 'చీమకుర్తి గెలాక్సీ గ్రానైట్ కేంద్రం', lat: 15.58, lon: 79.87 },
        { name: 'R.L.Puram', nameTe: 'ఆర్.ఎల్.పురం', lat: 15.56, lon: 79.89 }
      ]},
      { id: 'naguluppalapadu', name: 'Naguluppalapadu', nameTe: 'నాగులుప్పలపాడు', lgdCode: 5077, lat: 15.65, lon: 80.12, villages: [
        { name: 'N.G.Padu HQ', nameTe: 'నాగులుప్పలపాడు', lat: 15.65, lon: 80.12 }
      ]},
      { id: 'tangutur', name: 'Tangutur', nameTe: 'టంగుటూరు', lgdCode: 5078, lat: 15.39, lon: 80.02, villages: [
        { name: 'Tangutur (Tobacco Board Auctions)', nameTe: 'టంగుటూరు పొగాకు వేలం కేంద్రం', lat: 15.39, lon: 80.02 },
        { name: 'Valluru', nameTe: 'వల్లూరు', lat: 15.36, lon: 80.05 }
      ]},
      { id: 'singarayakonda', name: 'Singarayakonda', nameTe: 'సింగరాయకొండ', lgdCode: 5079, lat: 15.26, lon: 80.03, villages: [
        { name: 'Singarayakonda (Varaha Narasimha Temple)', nameTe: 'సింగరాయకొండ క్షేత్రం', lat: 15.26, lon: 80.03 },
        { name: 'Pakala Beach', nameTe: 'పాకాల తీరం', lat: 15.28, lon: 80.07 }
      ]},
      { id: 'kondapi', name: 'Kondapi', nameTe: 'కొండపి', lgdCode: 5080, lat: 15.42, lon: 79.89, villages: [
        { name: 'Kondapi HQ', nameTe: 'కొండపి', lat: 15.42, lon: 79.89 }
      ]},
      { id: 'zarugumalli', name: 'Zarugumalli', nameTe: 'జరుగుమల్లి', lgdCode: 5081, lat: 15.33, lon: 79.91, villages: [
        { name: 'Zarugumalli HQ', nameTe: 'జరుగుమల్లి', lat: 15.33, lon: 79.91 }
      ]},
      { id: 'ponnaluru', name: 'Ponnaluru', nameTe: 'పొన్నలూరు', lgdCode: 5082, lat: 15.31, lon: 79.82, villages: [
        { name: 'Ponnaluru HQ', nameTe: 'పొన్నలూరు', lat: 15.31, lon: 79.82 }
      ]},
      { id: 'marripudi', name: 'Marripudi', nameTe: 'మర్రిపూడి', lgdCode: 5083, lat: 15.44, lon: 79.73, villages: [
        { name: 'Marripudi HQ', nameTe: 'మర్రిపూడి', lat: 15.44, lon: 79.73 }
      ]},
      { id: 'markapuram', name: 'Markapuram', nameTe: 'మార్కాపురం', lgdCode: 5084, lat: 15.73, lon: 79.28, villages: [
        { name: 'Markapuram Town (Slate Stone Capital)', nameTe: 'మార్కాపురం (పలకల పరిశ్రమ)', lat: 15.73, lon: 79.28 },
        { name: 'Chennakesava Swamy Temple Vill', nameTe: 'చెన్నకేశవస్వామి క్షేత్రం', lat: 15.75, lon: 79.30 },
        { name: 'Rayavaram Mrk', nameTe: 'రాయవరం', lat: 15.71, lon: 79.26 }
      ]},
      { id: 'tarlupadu', name: 'Tarlupadu', nameTe: 'తర్లుపాడు', lgdCode: 5085, lat: 15.65, lon: 79.35, villages: [
        { name: 'Tarlupadu HQ', nameTe: 'తర్లుపాడు', lat: 15.65, lon: 79.35 }
      ]},
      { id: 'podili', name: 'Podili', nameTe: 'పొదిలి', lgdCode: 5086, lat: 15.60, lon: 79.60, villages: [
        { name: 'Podili Town', nameTe: 'పొదిలి టౌన్', lat: 15.60, lon: 79.60 },
        { name: 'Nimmamaheswarapuram', nameTe: 'నిమ్మమహేశ్వరపురం', lat: 15.58, lon: 79.62 }
      ]},
      { id: 'konakanamitla', name: 'Konakanamitla', nameTe: 'కొనకనమిట్ల', lgdCode: 5087, lat: 15.66, lon: 79.51, villages: [
        { name: 'Konakanamitla HQ', nameTe: 'కొనకనమిట్ల', lat: 15.66, lon: 79.51 }
      ]},
      { id: 'yerragondapalem', name: 'Yerragondapalem', nameTe: 'యర్రగొండపాలెం', lgdCode: 5088, lat: 16.03, lon: 79.31, villages: [
        { name: 'Yerragondapalem Town', nameTe: 'యర్రగొండపాలెం', lat: 16.03, lon: 79.31 },
        { name: 'Millampalli', nameTe: 'మిల్లంపల్లి', lat: 16.05, lon: 79.29 }
      ]},
      { id: 'dornala', name: 'Dornala', nameTe: 'దోర్నాల', lgdCode: 5089, lat: 15.90, lon: 79.10, villages: [
        { name: 'Dornala (Srisailam Ghat Entry Point)', nameTe: 'దోర్నాల (శ్రీశైలం మార్గం)', lat: 15.90, lon: 79.10 }
      ]},
      { id: 'tripuranthakam', name: 'Tripuranthakam', nameTe: 'త్రిపురాంతకం', lgdCode: 5090, lat: 16.00, lon: 79.44, villages: [
        { name: 'Tripuranthakam (Eastern Gateway to Srisailam)', nameTe: 'త్రిపురాంతక క్షేత్రం', lat: 16.00, lon: 79.44 }
      ]},
      { id: 'peddaraveedu', name: 'Peddaraveedu', nameTe: 'పెద్దారవీడు', lgdCode: 5091, lat: 15.82, lon: 79.26, villages: [
        { name: 'Peddaraveedu HQ', nameTe: 'పెద్దారవీడు', lat: 15.82, lon: 79.26 }
      ]},
      { id: 'pullalacheruvu', name: 'Pullalacheruvu', nameTe: 'పుల్లలచెరువు', lgdCode: 5092, lat: 16.14, lon: 79.39, villages: [
        { name: 'Pullalacheruvu HQ', nameTe: 'పుల్లలచెరువు', lat: 16.14, lon: 79.39 }
      ]},
      { id: 'giddalur', name: 'Giddalur', nameTe: 'గిద్దలూరు', lgdCode: 5093, lat: 15.37, lon: 78.92, villages: [
        { name: 'Giddalur Town (Nallamala Foothills)', nameTe: 'గిద్దలూరు టౌన్', lat: 15.37, lon: 78.92 },
        { name: 'Sanjaramula', nameTe: 'సంజరాముల', lat: 15.35, lon: 78.94 }
      ]},
      { id: 'bestavaripeta', name: 'Bestavaripeta', nameTe: 'బేస్తవారిపేట', lgdCode: 5094, lat: 15.55, lon: 79.10, villages: [
        { name: 'Bestavaripeta HQ', nameTe: 'బేస్తవారిపేట', lat: 15.55, lon: 79.10 }
      ]},
      { id: 'racherla', name: 'Racherla', nameTe: 'రాచర్ల', lgdCode: 5095, lat: 15.48, lon: 78.97, villages: [
        { name: 'Racherla HQ', nameTe: 'రాచర్ల', lat: 15.48, lon: 78.97 }
      ]},
      { id: 'komarolu', name: 'Komarolu', nameTe: 'కొమరోలు', lgdCode: 5096, lat: 15.26, lon: 78.99, villages: [
        { name: 'Komarolu HQ', nameTe: 'కొమరోలు', lat: 15.26, lon: 78.99 }
      ]},
      { id: 'cumbum', name: 'Cumbum', nameTe: 'కంబం', lgdCode: 5097, lat: 15.57, lon: 79.11, villages: [
        { name: 'Cumbum Historic Lake (Asia Ancient Tank)', nameTe: 'కంబం చెరువు చారిత్రక గ్రామం', lat: 15.57, lon: 79.11 }
      ]},
      { id: 'ardhaveedu', name: 'Ardhaveedu', nameTe: 'అర్ధవీడు', lgdCode: 5098, lat: 15.65, lon: 79.03, villages: [
        { name: 'Ardhaveedu HQ', nameTe: 'అర్ధవీడు', lat: 15.65, lon: 79.03 }
      ]},
      { id: 'kanigiri', name: 'Kanigiri', nameTe: 'కనిగిరి', lgdCode: 5099, lat: 15.40, lon: 79.51, villages: [
        { name: 'Kanigiri Town', nameTe: 'కనిగిరి టౌన్', lat: 15.40, lon: 79.51 },
        { name: 'Chinarikatla', nameTe: 'చినరికట్ల', lat: 15.42, lon: 79.49 }
      ]},
      { id: 'pamur', name: 'Pamur', nameTe: 'పామూరు', lgdCode: 5100, lat: 15.10, lon: 79.42, villages: [
        { name: 'Pamur Commercial Junction', nameTe: 'పామూరు', lat: 15.10, lon: 79.42 }
      ]},
      { id: 'cs_puram', name: 'C.S.Puram', nameTe: 'సి.ఎస్.పురం (చంద్రశేఖరపురం)', lgdCode: 5101, lat: 15.16, lon: 79.28, villages: [
        { name: 'C.S.Puram HQ', nameTe: 'సి.ఎస్.పురం', lat: 15.16, lon: 79.28 }
      ]},
      { id: 'veligandla', name: 'Veligandla', nameTe: 'వెలిగండ్ల', lgdCode: 5102, lat: 15.27, lon: 79.35, villages: [
        { name: 'Veligandla HQ', nameTe: 'వెలిగండ్ల', lat: 15.27, lon: 79.35 }
      ]},
      { id: 'hanumanthunipadu', name: 'Hanumanthunipadu', nameTe: 'హనుమంతునిపాడు', lgdCode: 5103, lat: 15.44, lon: 79.43, villages: [
        { name: 'H.M.Padu HQ', nameTe: 'హనుమంతునిపాడు', lat: 15.44, lon: 79.43 }
      ]},
      { id: 'darsi', name: 'Darsi', nameTe: 'దర్శి', lgdCode: 5104, lat: 15.76, lon: 79.68, villages: [
        { name: 'Darsi Commercial Town', nameTe: 'దర్శి టౌన్', lat: 15.76, lon: 79.68 },
        { name: 'Samanthapudi', nameTe: 'సామంతపూడి', lat: 15.74, lon: 79.70 }
      ]},
      { id: 'kurichedu', name: 'Kurichedu', nameTe: 'కురిచేడు', lgdCode: 5105, lat: 15.89, lon: 79.62, villages: [
        { name: 'Kurichedu HQ', nameTe: 'కురిచేడు', lat: 15.89, lon: 79.62 }
      ]},
      { id: 'mundlamuru', name: 'Mundlamuru', nameTe: 'ముండ్లమూరు', lgdCode: 5106, lat: 15.79, lon: 79.81, villages: [
        { name: 'Mundlamuru HQ', nameTe: 'ముండ్లమూరు', lat: 15.79, lon: 79.81 }
      ]},
      { id: 'donakonda', name: 'Donakonda', nameTe: 'దొనకొండ', lgdCode: 5107, lat: 15.82, lon: 79.49, villages: [
        { name: 'Donakonda Airport Strip', nameTe: 'దొనకొండ ఏరోడ్రోమ్', lat: 15.82, lon: 79.49 }
      ]},
      { id: 'tallur', name: 'Tallur', nameTe: 'తాళ్లూరు', lgdCode: 5108, lat: 15.70, lon: 79.76, villages: [
        { name: 'Tallur HQ', nameTe: 'తాళ్లూరు', lat: 15.70, lon: 79.76 }
      ]}
    ]
  },
  {
    id: 'sps_nellore',
    name: 'Sri Potti Sriramulu Nellore',
    nameTe: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు',
    lgdCode: 515,
    hq: 'Nellore',
    latitude: 14.4426,
    longitude: 79.9865,
    dominantSoil: 'coastal_sandy_and_red',
    soilDescTe: 'సముద్ర తీర ఇసుక, డెల్టా పెన్నా ఒండ్రు నేలలు (నెల్లూరు బియ్యం & రొయ్యల సాగు హబ్)',
    soilDescEn: 'Coastal sands, Penna deltaic alluvium and red loamy soils',
    commonCrops: ['Paddy', 'Fish/Prawn Culture', 'Sugarcane', 'Groundnut', 'Black Gram', 'Lemon'],
    commonCropsTe: ['వరి', 'ఆక్వా కల్చర్', 'చెరకు', 'వేరుశనగ', 'మినుములు', 'నిమ్మ'],
    mandals: [
      { id: 'nellore_urban', name: 'Nellore Urban', nameTe: 'నెల్లూరు అర్బన్', lgdCode: 5045, lat: 14.44, lon: 79.99, villages: [
        { name: 'Nellore Ranganatha Swamy Temple', nameTe: 'నెల్లూరు తల్పగిరి రంగనాథ క్షేత్రం', lat: 14.44, lon: 79.99 },
        { name: 'Stonehousepet', nameTe: 'స్టోన్‌హౌస్‌పేట', lat: 14.45, lon: 79.98 },
        { name: 'Magunta Layout', nameTe: 'మాగుంట లేఅవుట్', lat: 14.43, lon: 80.00 }
      ]},
      { id: 'nellore_rural', name: 'Nellore Rural', nameTe: 'నెల్లూరు రూరల్', lgdCode: 5046, lat: 14.41, lon: 79.95, villages: [
        { name: 'Golagamudi (Bhagavan Venkaiah Swamy Ashram)', nameTe: 'గొలగమూడి వెంకయ్యస్వామి ఆశ్రమం', lat: 14.38, lon: 79.92 },
        { name: 'South Mopuru', nameTe: 'సౌత్ మోపూరు', lat: 14.43, lon: 79.93 }
      ]},
      { id: 'kovur_nlr', name: 'Kovur', nameTe: 'కొవూరు', lgdCode: 5047, lat: 14.49, lon: 79.98, villages: [
        { name: 'Kovur Sugars', nameTe: 'కొవూరు', lat: 14.49, lon: 79.98 },
        { name: 'Padugupadu', nameTe: 'పడుగుపాడు', lat: 14.47, lon: 79.97 }
      ]},
      { id: 'indukurpet', name: 'Indukurpet', nameTe: 'ఇందుకూరుపేట', lgdCode: 5048, lat: 14.45, lon: 80.12, villages: [
        { name: 'Indukurpet HQ', nameTe: 'ఇందుకూరుపేట', lat: 14.45, lon: 80.12 },
        { name: 'Mypadu Beach', nameTe: 'మైపాడు బీచ్', lat: 14.51, lon: 80.18 }
      ]},
      { id: 'kodavalur', name: 'Kodavalur', nameTe: 'కొడవలూరు', lgdCode: 5049, lat: 14.54, lon: 79.99, villages: [
        { name: 'Kodavalur HQ', nameTe: 'కొడవలూరు', lat: 14.54, lon: 79.99 }
      ]},
      { id: 'vidavalur', name: 'Vidavalur', nameTe: 'విడవలూరు', lgdCode: 5050, lat: 14.58, lon: 80.11, villages: [
        { name: 'Ramateertham Sea Coast', nameTe: 'రామతీర్థం సముద్రతీరం', lat: 14.60, lon: 80.14 },
        { name: 'Vidavalur HQ', nameTe: 'విడవలూరు', lat: 14.58, lon: 80.11 }
      ]},
      { id: 'buchireddypalem', name: 'Buchireddypalem', nameTe: 'బుచ్చిరెడ్డిపాలెం', lgdCode: 5051, lat: 14.53, lon: 79.87, villages: [
        { name: 'Buchireddypalem (Kanigiri Reservoir)', nameTe: 'బుచ్చిరెడ్డిపాలెం కనిగిరి జలాశయం', lat: 14.53, lon: 79.87 },
        { name: 'Jonnavada (Malli Kamakshi Temple)', nameTe: 'జొన్నవాడ కామాక్షి క్షేత్రం', lat: 14.50, lon: 79.89 }
      ]},
      { id: 'kavali', name: 'Kavali', nameTe: 'కావలి', lgdCode: 5052, lat: 14.91, lon: 79.99, villages: [
        { name: 'Kavali Town (Educational Hub)', nameTe: 'కావలి టౌన్', lat: 14.91, lon: 79.99 },
        { name: 'Maddurupadu', nameTe: 'మద్దూరుపాడు', lat: 14.89, lon: 80.01 },
        { name: 'Musunuru Kvl', nameTe: 'ముసునూరు', lat: 14.93, lon: 79.98 }
      ]},
      { id: 'bogole', name: 'Bogole', nameTe: 'బోగోలు', lgdCode: 5053, lat: 14.82, lon: 80.01, villages: [
        { name: 'Bogole HQ', nameTe: 'బోగోలు', lat: 14.82, lon: 80.01 },
        { name: 'Bitragunta Railway Colony', nameTe: 'బిట్రగుంట', lat: 14.80, lon: 79.98 }
      ]},
      { id: 'dagadarthi', name: 'Dagadarthi', nameTe: 'దగదర్తి', lgdCode: 5054, lat: 14.68, lon: 79.97, villages: [
        { name: 'Dagadarthi Proposed Airport', nameTe: 'దగదర్తి ఎయిర్‌పోర్ట్ సైట్', lat: 14.68, lon: 79.97 }
      ]},
      { id: 'allur', name: 'Allur', nameTe: 'అల్లూరు', lgdCode: 5055, lat: 14.69, lon: 80.05, villages: [
        { name: 'Allur Commercial Centre', nameTe: 'అల్లూరు', lat: 14.69, lon: 80.05 },
        { name: 'Gogulapalle', nameTe: 'గోగులపల్లె', lat: 14.71, lon: 80.08 }
      ]},
      { id: 'jaladanki', name: 'Jaladanki', nameTe: 'జలదంకి', lgdCode: 5056, lat: 14.88, lon: 79.84, villages: [
        { name: 'Jaladanki HQ', nameTe: 'జలదంకి', lat: 14.88, lon: 79.84 }
      ]},
      { id: 'atmakur_nlr', name: 'Atmakur (Nellore)', nameTe: 'ఆత్మకూరు', lgdCode: 5057, lat: 14.52, lon: 79.62, villages: [
        { name: 'Atmakur Town', nameTe: 'ఆత్మకూరు టౌన్', lat: 14.52, lon: 79.62 },
        { name: 'Nellorepalem', nameTe: 'నెల్లూరుపాలెం', lat: 14.54, lon: 79.60 }
      ]},
      { id: 'marripadu', name: 'Marripadu', nameTe: 'మర్రిపాడు', lgdCode: 5058, lat: 14.58, lon: 79.43, villages: [
        { name: 'Marripadu HQ', nameTe: 'మర్రిపాడు', lat: 14.58, lon: 79.43 }
      ]},
      { id: 'ananthasagaram', name: 'Ananthasagaram', nameTe: 'అనంతసాగరం', lgdCode: 5059, lat: 14.58, lon: 79.48, villages: [
        { name: 'Ananthasagaram Tank', nameTe: 'అనంతసాగరం పెద్ద చెరువు', lat: 14.58, lon: 79.48 }
      ]},
      { id: 'chejerla', name: 'Chejerla', nameTe: 'చేజర్ల', lgdCode: 5060, lat: 14.53, lon: 79.52, villages: [
        { name: 'Chejerla (Kapoteswara Swamy)', nameTe: 'చేజర్ల కపోతేశ్వర క్షేత్రం', lat: 14.53, lon: 79.52 }
      ]},
      { id: 'sangam', name: 'Sangam', nameTe: 'సంగం', lgdCode: 5061, lat: 14.58, lon: 79.74, villages: [
        { name: 'Sangam (Penna, Boggeru, Biraperu Tri-Sangam)', nameTe: 'సంగం త్రివేణి సంగమ క్షేత్రం', lat: 14.58, lon: 79.74 }
      ]},
      { id: 'as_peta', name: 'A.S.Peta', nameTe: 'ఎ.ఎస్.పేట (ఆనందసాగరం)', lgdCode: 5062, lat: 14.64, lon: 79.46, villages: [
        { name: 'A.S.Peta Dargah', nameTe: 'ఎ.ఎస్.పేట దర్గా', lat: 14.64, lon: 79.46 }
      ]},
      { id: 'podalakur', name: 'Podalakur', nameTe: 'పొదలకూరు', lgdCode: 5063, lat: 14.37, lon: 79.73, villages: [
        { name: 'Podalakur HQ', nameTe: 'పొదలకూరు', lat: 14.37, lon: 79.73 },
        { name: 'Toderu', nameTe: 'తోడేరు', lat: 14.35, lon: 79.75 }
      ]},
      { id: 'manubolu', name: 'Manubolu', nameTe: 'మనుబోలు', lgdCode: 5064, lat: 14.28, lon: 79.94, villages: [
        { name: 'Manubolu HQ', nameTe: 'మనుబోలు', lat: 14.28, lon: 79.94 }
      ]},
      { id: 'venkatachalam', name: 'Venkatachalam', nameTe: 'వెంకటాచలం', lgdCode: 5065, lat: 14.31, lon: 80.01, villages: [
        { name: 'Venkatachalam (Swarna Bharat Trust)', nameTe: 'వెంకటాచలం', lat: 14.31, lon: 80.01 },
        { name: 'Kasumuru Dargah', nameTe: 'కాసుమూరు దర్గా', lat: 14.33, lon: 79.97 }
      ]},
      { id: 'muthukur', name: 'Muthukur', nameTe: 'ముత్తుకూరు', lgdCode: 5066, lat: 14.27, lon: 80.12, villages: [
        { name: 'Krishnapatnam Port Terminal', nameTe: 'కృష్ణపట్నం పోర్ట్', lat: 14.25, lon: 80.13 },
        { name: 'Muthukur Fisheries College', nameTe: 'ముత్తుకూరు', lat: 14.27, lon: 80.12 }
      ]},
      { id: 'thotapalligudur', name: 'Thotapalligudur', nameTe: 'తోటపల్లిగూడూరు', lgdCode: 5067, lat: 14.35, lon: 80.10, villages: [
        { name: 'Thotapalligudur HQ', nameTe: 'తోటపల్లిగూడూరు', lat: 14.35, lon: 80.10 }
      ]},
      { id: 'kandukur', name: 'Kandukur', nameTe: 'కందుకూరు', lgdCode: 5068, lat: 15.22, lon: 79.90, villages: [
        { name: 'Kandukur Commercial Town', nameTe: 'కందుకూరు టౌన్', lat: 15.22, lon: 79.90 },
        { name: 'Ananthavaram Knd', nameTe: 'అనంతవరం', lat: 15.20, lon: 79.92 }
      ]},
      { id: 'lingasamudram', name: 'Lingasamudram', nameTe: 'లింగసముద్రం', lgdCode: 5069, lat: 15.11, lon: 79.82, villages: [
        { name: 'Lingasamudram HQ', nameTe: 'లింగసముద్రం', lat: 15.11, lon: 79.82 }
      ]},
      { id: 'gudluru', name: 'Gudluru', nameTe: 'గుడ్లూరు', lgdCode: 5070, lat: 15.09, lon: 79.94, villages: [
        { name: 'Gudluru HQ', nameTe: 'గుడ్లూరు', lat: 15.09, lon: 79.94 }
      ]},
      { id: 'ulavapadu', name: 'Ulavapadu', nameTe: 'ఉలవపాడు', lgdCode: 5071, lat: 15.18, lon: 80.01, villages: [
        { name: 'Ulavapadu (Famous Banganapalle Mango Hub)', nameTe: 'ఉలవపాడు మామిడి మార్కెట్', lat: 15.18, lon: 80.01 },
        { name: 'Karedu Coastal', nameTe: 'కారేడు తీరం', lat: 15.15, lon: 80.05 }
      ]},
      { id: 'voletivaripalem', name: 'Voletivaripalem', nameTe: 'వోలేటివారిపాలెం', lgdCode: 5072, lat: 15.20, lon: 79.79, villages: [
        { name: 'Voletivaripalem HQ', nameTe: 'వోలేటివారిపాలెం', lat: 15.20, lon: 79.79 },
        { name: 'Malakonda (Narasimha Swamy Shrine)', nameTe: 'మాలకొండ క్షేత్రం', lat: 15.18, lon: 79.75 }
      ]},
      { id: 'udayagiri', name: 'Udayagiri', nameTe: 'ఉదయగిరి', lgdCode: 5073, lat: 14.87, lon: 79.31, villages: [
        { name: 'Udayagiri (Historical Hill Fort)', nameTe: 'ఉదయగిరి కోట టౌన్', lat: 14.87, lon: 79.31 },
        { name: 'Gandipalem Project', nameTe: 'గండిపాలెం జలాశయం', lat: 14.84, lon: 79.29 }
      ]},
      { id: 'seetharamapuram', name: 'Seetharamapuram', nameTe: 'సీతారామపురం', lgdCode: 5074, lat: 14.98, lon: 79.16, villages: [
        { name: 'S.R.Puram HQ', nameTe: 'సీతారామపురం', lat: 14.98, lon: 79.16 }
      ]},
      { id: 'varikuntapadu', name: 'Varikuntapadu', nameTe: 'వరికుంటపాడు', lgdCode: 5075, lat: 15.01, lon: 79.34, villages: [
        { name: 'Varikuntapadu HQ', nameTe: 'వరికుంటపాడు', lat: 15.01, lon: 79.34 }
      ]},
      { id: 'kaligiri', name: 'Kaligiri', nameTe: 'కలిగిరి', lgdCode: 5076, lat: 14.81, lon: 79.70, villages: [
        { name: 'Kaligiri HQ', nameTe: 'కలిగిరి', lat: 14.81, lon: 79.70 }
      ]},
      { id: 'vinjamur', name: 'Vinjamur', nameTe: 'వింజమూరు', lgdCode: 5077, lat: 14.84, lon: 79.58, villages: [
        { name: 'Vinjamur Commercial Centre', nameTe: 'వింజమూరు', lat: 14.84, lon: 79.58 }
      ]},
      { id: 'duttalur', name: 'Duttalur', nameTe: 'దత్తలూరు', lgdCode: 5078, lat: 14.87, lon: 79.46, villages: [
        { name: 'Duttalur HQ', nameTe: 'దత్తలూరు', lat: 14.87, lon: 79.46 }
      ]}
    ]
  },
  {
    id: 'sri_sathya_sai',
    name: 'Sri Sathya Sai',
    nameTe: 'శ్రీ సత్యసాయి',
    lgdCode: 755,
    hq: 'Puttaparthi',
    latitude: 14.1666,
    longitude: 77.8116,
    dominantSoil: 'red_gravelly',
    soilDescTe: 'ఎర్ర మొరం నేలలు మరియు ఇసుక నేలలు (వేరుశనగ, పట్టు మరియు ఉద్యానవన నేలలు)',
    soilDescEn: 'Red gravelly loams, shallow soils and rainfed drylands',
    commonCrops: ['Groundnut', 'Mulberry/Sericulture', 'Sweet Orange', 'Tamarind', 'Millets', 'Paddy'],
    commonCropsTe: ['వేరుశనగ', 'మల్బరీ (పట్టు పురుగులు)', 'బత్తాయి', 'చింతపండు', 'చిరుధాన్యాలు', 'వరి'],
    mandals: [
      { id: 'puttaparthi', name: 'Puttaparthi', nameTe: 'పుట్టపర్తి', lgdCode: 4962, lat: 14.17, lon: 77.81, villages: [
        { name: 'Prasanthi Nilayam Ashram', nameTe: 'ప్రశాంతి నిలయం ఆశ్రమం', lat: 14.17, lon: 77.81 },
        { name: 'Puttaparthi Airport Area', nameTe: 'పుట్టపర్తి ఎయిర్‌పోర్ట్', lat: 14.15, lon: 77.79 },
        { name: 'Kothacheruvu Road', nameTe: 'కొత్తచెరువు రోడ్డు', lat: 14.18, lon: 77.83 }
      ]},
      { id: 'bukkapatnam', name: 'Bukkapatnam', nameTe: 'బుక్కపట్నం', lgdCode: 4963, lat: 14.21, lon: 77.85, villages: [
        { name: 'Bukkapatnam Cheruvu (Historic Tank)', nameTe: 'బుక్కపట్నం చారిత్రక చెరువు', lat: 14.21, lon: 77.85 }
      ]},
      { id: 'kothacheruvu', name: 'Kothacheruvu', nameTe: 'కొత్తచెరువు', lgdCode: 4964, lat: 14.19, lon: 77.77, villages: [
        { name: 'Kothacheruvu Town', nameTe: 'కొత్తచెరువు టౌన్', lat: 14.19, lon: 77.77 }
      ]},
      { id: 'nallamada', name: 'Nallamada', nameTe: 'నల్లమాడ', lgdCode: 4965, lat: 14.18, lon: 77.99, villages: [
        { name: 'Nallamada HQ', nameTe: 'నల్లమాడ', lat: 14.18, lon: 77.99 }
      ]},
      { id: 'od_cheruvu', name: 'O.D.Cheruvu', nameTe: 'ఓబులదేవరచెరువు (ఓ.డి.చెరువు)', lgdCode: 4966, lat: 14.07, lon: 77.88, villages: [
        { name: 'O.D.Cheruvu HQ', nameTe: 'ఓ.డి.చెరువు', lat: 14.07, lon: 77.88 }
      ]},
      { id: 'gorantla', name: 'Gorantla', nameTe: 'గోరంట్ల', lgdCode: 4967, lat: 13.99, lon: 77.77, villages: [
        { name: 'Gorantla (Madhavaraya Swamy Temple)', nameTe: 'గోరంట్ల మాధవరాయ క్షేత్రం', lat: 13.99, lon: 77.77 }
      ]},
      { id: 'kadiri', name: 'Kadiri', nameTe: 'కదిరి', lgdCode: 4968, lat: 14.11, lon: 78.16, villages: [
        { name: 'Kadiri (Sri Lakshmi Narasimha Swamy)', nameTe: 'కదిరి లక్ష్మీ నరసింహ క్షేత్రం', lat: 14.11, lon: 78.16 },
        { name: 'Thimmamma Marrimanu (World Largest Banyan Tree)', nameTe: 'తిమ్మమ్మ మర్రిమాను', lat: 14.14, lon: 78.20 },
        { name: 'Kutagulla', nameTe: 'కుటగుళ్ల', lat: 14.08, lon: 78.14 }
      ]},
      { id: 'talupula', name: 'Talupula', nameTe: 'తలుపుల', lgdCode: 4969, lat: 14.24, lon: 78.26, villages: [
        { name: 'Talupula HQ', nameTe: 'తలుపుల', lat: 14.24, lon: 78.26 }
      ]},
      { id: 'nambulapulikunta', name: 'Nambulapulikunta', nameTe: 'నంబులపూలకుంట', lgdCode: 4970, lat: 14.07, lon: 78.36, villages: [
        { name: 'N.P.Kunta (Ultra Mega Solar Park)', nameTe: 'ఎన్.పి.కుంట సోలార్ పార్క్', lat: 14.07, lon: 78.36 }
      ]},
      { id: 'gandlapenta', name: 'Gandlapenta', nameTe: 'గాండ్లపెంట', lgdCode: 4971, lat: 14.01, lon: 78.28, villages: [
        { name: 'Gandlapenta HQ', nameTe: 'గాండ్లపెంట', lat: 14.01, lon: 78.28 }
      ]},
      { id: 'nallacheruvu', name: 'Nallacheruvu', nameTe: 'నల్లచెరువు', lgdCode: 4972, lat: 13.97, lon: 78.17, villages: [
        { name: 'Nallacheruvu HQ', nameTe: 'నల్లచెరువు', lat: 13.97, lon: 78.17 }
      ]},
      { id: 'mudigubba', name: 'Mudigubba', nameTe: 'ముదిగుబ్బ', lgdCode: 4973, lat: 14.34, lon: 77.98, villages: [
        { name: 'Mudigubba HQ', nameTe: 'ముదిగుబ్బ', lat: 14.34, lon: 77.98 }
      ]},
      { id: 'dharmavaram', name: 'Dharmavaram', nameTe: 'ధర్మవరం', lgdCode: 4974, lat: 14.41, lon: 77.72, villages: [
        { name: 'Dharmavaram (Silk Handloom Saree Capital)', nameTe: 'ధర్మవరం చేనేత పట్టు చీరల నగరం', lat: 14.41, lon: 77.72 },
        { name: 'Gotlur', nameTe: 'గోట్లూరు', lat: 14.39, lon: 77.70 },
        { name: 'Kuntimaddi', nameTe: 'కుంటిమద్ది', lat: 14.43, lon: 77.75 }
      ]},
      { id: 'bathalapalli', name: 'Bathalapalli', nameTe: 'బత్తలపల్లి', lgdCode: 4975, lat: 14.52, lon: 77.78, villages: [
        { name: 'Bathalapalli RDT Hospital Area', nameTe: 'బత్తలపల్లి ఆర్డీటీ ఆసుపత్రి ప్రాంతం', lat: 14.52, lon: 77.78 }
      ]},
      { id: 'tadimarri', name: 'Tadimarri', nameTe: 'తాడిమర్రి', lgdCode: 4976, lat: 14.56, lon: 77.86, villages: [
        { name: 'Tadimarri HQ', nameTe: 'తాడిమర్రి', lat: 14.56, lon: 77.86 }
      ]},
      { id: 'kanaganapalli', name: 'Kanaganapalli', nameTe: 'కనగానపల్లి', lgdCode: 4977, lat: 14.43, lon: 77.52, villages: [
        { name: 'Kanaganapalli HQ', nameTe: 'కనగానపల్లి', lat: 14.43, lon: 77.52 }
      ]},
      { id: 'ramagiri', name: 'Ramagiri', nameTe: 'రామగిరి', lgdCode: 4978, lat: 14.31, lon: 77.49, villages: [
        { name: 'Ramagiri (Historic Gold Fields & Windmills)', nameTe: 'రామగిరి గనుల గ్రామం', lat: 14.31, lon: 77.49 }
      ]},
      { id: 'penukonda', name: 'Penukonda', nameTe: 'పెనుకొండ', lgdCode: 4979, lat: 14.08, lon: 77.59, villages: [
        { name: 'Penukonda (Vijayanagara Second Capital)', nameTe: 'పెనుకొండ చారిత్రక రాజధాని', lat: 14.08, lon: 77.59 },
        { name: 'Erramanchi (KIA Motors Mega Plant)', nameTe: 'ఎర్రమంచి కియా కార్ల కేంద్రం', lat: 14.12, lon: 77.62 },
        { name: 'Guttur Industrial Zone', nameTe: 'గుత్తూరు', lat: 14.05, lon: 77.58 }
      ]},
      { id: 'somandepalli', name: 'Somandepalli', nameTe: 'సోమందేపల్లి', lgdCode: 4980, lat: 14.01, lon: 77.61, villages: [
        { name: 'Somandepalli HQ', nameTe: 'సోమందేపల్లి', lat: 14.01, lon: 77.61 }
      ]},
      { id: 'roddam', name: 'Roddam', nameTe: 'రొద్దం', lgdCode: 4981, lat: 14.10, lon: 77.44, villages: [
        { name: 'Roddam HQ', nameTe: 'రొద్దం', lat: 14.10, lon: 77.44 }
      ]},
      { id: 'hindupur', name: 'Hindupur', nameTe: 'హిందూపురం', lgdCode: 4982, lat: 13.83, lon: 77.49, villages: [
        { name: 'Hindupur Commercial City (Silk Reeling Hub)', nameTe: 'హిందూపురం (పట్టు గూళ్ల మార్కెట్)', lat: 13.83, lon: 77.49 },
        { name: 'Kotnur', nameTe: 'కొట్నూరు', lat: 13.85, lon: 77.47 },
        { name: 'Melavoi', nameTe: 'మేళవాయి', lat: 13.81, lon: 77.51 }
      ]},
      { id: 'lepakshi', name: 'Lepakshi', nameTe: 'లేపాక్షి', lgdCode: 4983, lat: 13.80, lon: 77.61, villages: [
        { name: 'Lepakshi (Veerabhadra Swamy & Hanging Pillar)', nameTe: 'లేపాక్షి (వీరభద్ర స్వామి & నంది విగ్రహం)', lat: 13.80, lon: 77.61 },
        { name: 'Kanchisamudram', nameTe: 'కంచిసముద్రం', lat: 13.78, lon: 77.59 }
      ]},
      { id: 'chilamathur', name: 'Chilamathur', nameTe: 'చిలమత్తూరు', lgdCode: 4984, lat: 13.84, lon: 77.71, villages: [
        { name: 'Chilamathur (Kodur Border)', nameTe: 'చిలమత్తూరు', lat: 13.84, lon: 77.71 }
      ]},
      { id: 'madakasira', name: 'Madakasira', nameTe: 'మడకశిర', lgdCode: 4985, lat: 13.94, lon: 77.27, villages: [
        { name: 'Madakasira Fort Town', nameTe: 'మడకశిర కోట టౌన్', lat: 13.94, lon: 77.27 },
        { name: 'Rolla Road Vill', nameTe: 'రొళ్ల రోడ్డు', lat: 13.92, lon: 77.29 }
      ]},
      { id: 'amarapuram', name: 'Amarapuram', nameTe: 'అమరాపురం', lgdCode: 4986, lat: 14.12, lon: 76.99, villages: [
        { name: 'Amarapuram HQ', nameTe: 'అమరాపురం', lat: 14.12, lon: 76.99 }
      ]},
      { id: 'gudibanda', name: 'Gudibanda', nameTe: 'గుడిబండ', lgdCode: 4987, lat: 14.01, lon: 77.01, villages: [
        { name: 'Gudibanda HQ', nameTe: 'గుడిబండ', lat: 14.01, lon: 77.01 }
      ]},
      { id: 'rolla', name: 'Rolla', nameTe: 'రొళ్ల', lgdCode: 4988, lat: 13.83, lon: 77.11, villages: [
        { name: 'Rolla HQ', nameTe: 'రొళ్ల', lat: 13.83, lon: 77.11 }
      ]},
      { id: 'agali', name: 'Agali', nameTe: 'అగళి', lgdCode: 4989, lat: 13.88, lon: 77.03, villages: [
        { name: 'Agali Border HQ', nameTe: 'అగళి', lat: 13.88, lon: 77.03 }
      ]}
    ]
  }
];
