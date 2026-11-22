// Districts 8 to 14: East Godavari, Eluru, Guntur, Kakinada, Krishna, Kurnool, Nandyal

module.exports = [
  {
    id: 'east_godavari',
    name: 'East Godavari',
    nameTe: 'తూర్పు గోదావరి',
    lgdCode: 505,
    hq: 'Rajahmundry',
    latitude: 17.0005,
    longitude: 81.8040,
    dominantSoil: 'alluvial',
    soilDescTe: 'సారవంతమైన గోదావరి ఒండ్రు నేలలు మరియు ఎర్ర రేగడి నేలలు (వరి, నర్సరీలు, చెరకు)',
    soilDescEn: 'Fertile Godavari river alluvium and red sandy clay loams',
    commonCrops: ['Paddy', 'Nursery Plants/Flowers', 'Sugarcane', 'Banana', 'Maize', 'Tobacco'],
    commonCropsTe: ['వరి', 'నర్సరీ మొక్కలు/పూలు', 'చెరకు', 'అరటి', 'మొక్కజొన్న', 'పొగాకు'],
    mandals: [
      { id: 'rajahmundry_urban', name: 'Rajahmundry Urban', nameTe: 'రాజమండ్రి అర్బన్', lgdCode: 4890, lat: 17.00, lon: 81.80, villages: [
        { name: 'Rajahmundry City', nameTe: 'రాజమండ్రి నగరం', lat: 17.00, lon: 81.80 },
        { name: 'Aryapuram', nameTe: 'ఆర్యపురం', lat: 17.01, lon: 81.79 }
      ]},
      { id: 'rajahmundry_rural', name: 'Rajahmundry Rural', nameTe: 'రాజమండ్రి రూరల్', lgdCode: 4891, lat: 16.98, lon: 81.83, villages: [
        { name: 'Dowleswaram (Sir Arthur Cotton Barrage)', nameTe: 'ధవళేశ్వరం (కాటన్ బ్యారేజ్)', lat: 16.94, lon: 81.77 },
        { name: 'Katheru', nameTe: 'కాతేరు', lat: 17.02, lon: 81.81 },
        { name: 'Hukumpeta E.G.', nameTe: 'హుకుంపేట', lat: 16.97, lon: 81.84 }
      ]},
      { id: 'kadiam', name: 'Kadiam', nameTe: 'కడియం', lgdCode: 4892, lat: 16.92, lon: 81.83, villages: [
        { name: 'Kadiam (Asia Largest Nursery Hub)', nameTe: 'కడియం (నర్సరీల కేంద్రం)', lat: 16.92, lon: 81.83 },
        { name: 'Kadiyapulanka', nameTe: 'కడియపులంక', lat: 16.90, lon: 81.85 },
        { name: 'Burrilanka', nameTe: 'బుర్రిలంక', lat: 16.89, lon: 81.86 },
        { name: 'Damireddipalli', nameTe: 'దామిరెడ్డిపల్లి', lat: 16.94, lon: 81.81 }
      ]},
      { id: 'rajanagaram', name: 'Rajanagaram', nameTe: 'రాజానగరం', lgdCode: 4893, lat: 17.08, lon: 81.90, villages: [
        { name: 'Rajanagaram HQ', nameTe: 'రాజానగరం', lat: 17.08, lon: 81.90 },
        { name: 'Dosakayalapalli', nameTe: 'దోసకాయలపల్లి', lat: 17.11, lon: 81.88 }
      ]},
      { id: 'korukonda', name: 'Korukonda', nameTe: 'కోరుకొండ', lgdCode: 4894, lat: 17.17, lon: 81.83, villages: [
        { name: 'Korukonda (Narasimha Swamy Temple)', nameTe: 'కోరుకొండ లక్ష్మీ నరసింహ క్షేత్రం', lat: 17.17, lon: 81.83 },
        { name: 'Raghudevapuram', nameTe: 'రాఘవదేవపురం', lat: 17.19, lon: 81.80 }
      ]},
      { id: 'seethanagaram_eg', name: 'Seethanagaram (East Godavari)', nameTe: 'సీతానగరం', lgdCode: 4895, lat: 17.20, lon: 81.69, villages: [
        { name: 'Seethanagaram HQ', nameTe: 'సీతానగరం', lat: 17.20, lon: 81.69 },
        { name: 'Muggulla', nameTe: 'ముగ్గుళ్ళ', lat: 17.22, lon: 81.67 }
      ]},
      { id: 'gokavaram', name: 'Gokavaram', nameTe: 'గోకవరం', lgdCode: 4896, lat: 17.25, lon: 81.92, villages: [
        { name: 'Gokavaram HQ', nameTe: 'గోకవరం', lat: 17.25, lon: 81.92 },
        { name: 'Tantikonda', nameTe: 'తంటికొండ', lat: 17.28, lon: 81.95 }
      ]},
      { id: 'anaparthy', name: 'Anaparthy', nameTe: 'అనపర్తి', lgdCode: 4897, lat: 16.98, lon: 81.97, villages: [
        { name: 'Anaparthy Town', nameTe: 'అనపర్తి టౌన్', lat: 16.98, lon: 81.97 },
        { name: 'Ramavaram', nameTe: 'రామవరం', lat: 17.00, lon: 81.95 },
        { name: 'Polamuru', nameTe: 'పోలమూరు', lat: 16.96, lon: 81.99 }
      ]},
      { id: 'biccavolu', name: 'Biccavolu', nameTe: 'బిక్కవోలు', lgdCode: 4898, lat: 17.02, lon: 82.04, villages: [
        { name: 'Biccavolu (Vinayaka Kshetram)', nameTe: 'బిక్కవోలు గణపతి క్షేత్రం', lat: 17.02, lon: 82.04 },
        { name: 'Arikarevula', nameTe: 'అరికారేవ్యుల', lat: 17.04, lon: 82.02 }
      ]},
      { id: 'rangampeta', name: 'Rangampeta', nameTe: 'రంగంపేట', lgdCode: 4899, lat: 17.07, lon: 82.01, villages: [
        { name: 'Rangampeta HQ', nameTe: 'రంగంపేట', lat: 17.07, lon: 82.01 },
        { name: 'Vadisaleru', nameTe: 'వడిసలేరు', lat: 17.09, lon: 81.99 }
      ]},
      { id: 'kovvur', name: 'Kovvur', nameTe: 'కొవ్వూరు', lgdCode: 4900, lat: 17.01, lon: 81.72, villages: [
        { name: 'Kovvur Goshpada Kshetram', nameTe: 'కొవ్వూరు గోష్పాద క్షేత్రం', lat: 17.01, lon: 81.72 },
        { name: 'Arikirevula Kovvur', nameTe: 'అరికిరేవుల', lat: 16.99, lon: 81.70 },
        { name: 'Dharmavaram Kvr', nameTe: 'ధర్మవరం', lat: 17.03, lon: 81.74 }
      ]},
      { id: 'chagallu', name: 'Chagallu', nameTe: 'చాగల్లు', lgdCode: 4901, lat: 16.99, lon: 81.65, villages: [
        { name: 'Chagallu Sugars', nameTe: 'చాగల్లు (షుగర్ ఫ్యాక్టరీ)', lat: 16.99, lon: 81.65 },
        { name: 'Brahmanagudem', nameTe: 'బ్రాహ్మణగూడెం', lat: 16.97, lon: 81.67 }
      ]},
      { id: 'tallapudi', name: 'Tallapudi', nameTe: 'తాళ్లపూడి', lgdCode: 4902, lat: 17.11, lon: 81.68, villages: [
        { name: 'Tallapudi HQ', nameTe: 'తాళ్లపూడి', lat: 17.11, lon: 81.68 },
        { name: 'Vegeswarapuram', nameTe: 'వేగేశ్వరపురం', lat: 17.09, lon: 81.69 }
      ]},
      { id: 'nidadavole', name: 'Nidadavole', nameTe: 'నిడదవోలు', lgdCode: 4903, lat: 16.91, lon: 81.67, villages: [
        { name: 'Nidadavole Town (Railway Junction)', nameTe: 'నిడదవోలు టౌన్', lat: 16.91, lon: 81.67 },
        { name: 'Settipeta', nameTe: 'శెట్టిపేట', lat: 16.89, lon: 81.69 },
        { name: 'Samisragudem', nameTe: 'సమిస్రగూడెం', lat: 16.93, lon: 81.65 }
      ]},
      { id: 'peravali', name: 'Peravali', nameTe: 'పేరవలి', lgdCode: 4904, lat: 16.78, lon: 81.72, villages: [
        { name: 'Peravali HQ', nameTe: 'పేరవలి', lat: 16.78, lon: 81.72 },
        { name: 'Teeparru', nameTe: 'తీపర్రు', lat: 16.76, lon: 81.74 }
      ]},
      { id: 'undrajavaram', name: 'Undrajavaram', nameTe: 'ఉండ్రాజవరం', lgdCode: 4905, lat: 16.84, lon: 81.67, villages: [
        { name: 'Undrajavaram HQ', nameTe: 'ఉండ్రాజవరం', lat: 16.84, lon: 81.67 }
      ]},
      { id: 'gopalapuram', name: 'Gopalapuram', nameTe: 'గోపాలపురం', lgdCode: 4906, lat: 17.10, lon: 81.54, villages: [
        { name: 'Gopalapuram HQ', nameTe: 'గోపాలపురం', lat: 17.10, lon: 81.54 },
        { name: 'Kovvurupadu', nameTe: 'కొవ్వూరుపాడు', lat: 17.08, lon: 81.56 }
      ]},
      { id: 'devarapalle_eg', name: 'Devarapalle (East Godavari)', nameTe: 'దేవరపల్లి', lgdCode: 4907, lat: 17.03, lon: 81.56, villages: [
        { name: 'Devarapalle HQ', nameTe: 'దేవరపల్లి', lat: 17.03, lon: 81.56 }
      ]},
      { id: 'nallajerla', name: 'Nallajerla', nameTe: 'నల్లజర్ల', lgdCode: 4908, lat: 16.95, lon: 81.46, villages: [
        { name: 'Nallajerla HQ', nameTe: 'నల్లజర్ల', lat: 16.95, lon: 81.46 },
        { name: 'Ananthapalli', nameTe: 'అనంతపల్లి', lat: 16.97, lon: 81.44 }
      ]}
    ]
  },
  {
    id: 'eluru',
    name: 'Eluru',
    nameTe: 'ఏలూరు',
    lgdCode: 749,
    hq: 'Eluru',
    latitude: 16.7107,
    longitude: 81.0952,
    dominantSoil: 'alluvial_and_black',
    soilDescTe: 'సారవంతమైన కొల్లేరు డెల్టా ఒండ్రు నేలలు మరియు మెట్ట ఎర్ర నేలలు',
    soilDescEn: 'Alluvial Kolleru basin soils, coastal clays and upland red loams',
    commonCrops: ['Paddy', 'Fish/Prawn Culture', 'Oil Palm', 'Cocoa', 'Maize', 'Tobacco', 'Mango'],
    commonCropsTe: ['వరి', 'ఆక్వా కల్చర్', 'ఆయిల్ పామ్', 'కోకో', 'మొక్కజొన్న', 'పొగాకు', 'మామిడి'],
    mandals: [
      { id: 'eluru', name: 'Eluru', nameTe: 'ఏలూరు', lgdCode: 4961, lat: 16.71, lon: 81.10, villages: [
        { name: 'Eluru City (Carpet Hub)', nameTe: 'ఏలూరు నగరం', lat: 16.71, lon: 81.10 },
        { name: 'Sanivarapupeta', nameTe: 'శనివారపుపేట', lat: 16.73, lon: 81.08 },
        { name: 'Tangellamudi', nameTe: 'తంగెళ్ళమూడి', lat: 16.69, lon: 81.12 },
        { name: 'Vatluru', nameTe: 'వట్లూరు', lat: 16.68, lon: 81.06 }
      ]},
      { id: 'denduluru', name: 'Denduluru', nameTe: 'దెందులూరు', lgdCode: 4962, lat: 16.76, lon: 81.17, villages: [
        { name: 'Denduluru Historical HQ', nameTe: 'దెందులూరు', lat: 16.76, lon: 81.17 },
        { name: 'Vegivada', nameTe: 'వేగివాడ', lat: 16.78, lon: 81.15 }
      ]},
      { id: 'pedavegi', name: 'Pedavegi', nameTe: 'పెదవేగి', lgdCode: 4963, lat: 16.81, lon: 81.12, villages: [
        { name: 'Pedavegi (Vengi Ancient Capital)', nameTe: 'పెదవేగి (ప్రాచీన వేంగి)', lat: 16.81, lon: 81.12 }
      ]},
      { id: 'pedapadu', name: 'Pedapadu', nameTe: 'పెదపాడు', lgdCode: 4964, lat: 16.65, lon: 81.01, villages: [
        { name: 'Pedapadu HQ', nameTe: 'పెదపాడు', lat: 16.65, lon: 81.01 }
      ]},
      { id: 'unguturu_elr', name: 'Unguturu', nameTe: 'ఉంగుటూరు', lgdCode: 4965, lat: 16.78, lon: 81.44, villages: [
        { name: 'Unguturu HQ', nameTe: 'ఉంగుటూరు', lat: 16.78, lon: 81.44 },
        { name: 'Chebrolu Elr', nameTe: 'చేబ్రోలు', lat: 16.80, lon: 81.42 }
      ]},
      { id: 'bhimadole', name: 'Bhimadole', nameTe: 'భీమడోలు', lgdCode: 4966, lat: 16.81, lon: 81.27, villages: [
        { name: 'Bhimadole Junction', nameTe: 'భీమడోలు జంక్షన్', lat: 16.81, lon: 81.27 },
        { name: 'Pulla', nameTe: 'పుల్ల', lat: 16.79, lon: 81.29 }
      ]},
      { id: 'nidamarru', name: 'Nidamarru', nameTe: 'నిడమర్రు', lgdCode: 4967, lat: 16.72, lon: 81.39, villages: [
        { name: 'Nidamarru HQ', nameTe: 'నిడమర్రు', lat: 16.72, lon: 81.39 }
      ]},
      { id: 'ganapavaram', name: 'Ganapavaram', nameTe: 'గణపవరం', lgdCode: 4968, lat: 16.69, lon: 81.47, villages: [
        { name: 'Ganapavaram HQ', nameTe: 'గణపవరం', lat: 16.69, lon: 81.47 },
        { name: 'Pippara', nameTe: 'పిప్పర', lat: 16.67, lon: 81.49 }
      ]},
      { id: 'chintalapudi', name: 'Chintalapudi', nameTe: 'చింతలపూడి', lgdCode: 4969, lat: 17.07, lon: 80.99, villages: [
        { name: 'Chintalapudi Town (Oil Palm Hub)', nameTe: 'చింతలపూడి (ఆయిల్ పామ్ హబ్)', lat: 17.07, lon: 80.99 },
        { name: 'Pragadavaram', nameTe: 'ప్రగడవరం', lat: 17.04, lon: 81.02 }
      ]},
      { id: 'lingapalem', name: 'Lingapalem', nameTe: 'లింగపాలెం', lgdCode: 4970, lat: 17.02, lon: 80.93, villages: [
        { name: 'Lingapalem HQ', nameTe: 'లింగపాలెం', lat: 17.02, lon: 80.93 },
        { name: 'Dharmajigudem', nameTe: 'ధర్మజిగూడెం', lat: 17.00, lon: 80.91 }
      ]},
      { id: 'kamavarapukota', name: 'Kamavarapukota', nameTe: 'కామవరపుకోట', lgdCode: 4971, lat: 16.95, lon: 81.19, villages: [
        { name: 'Kamavarapukota (Guntupalli Caves)', nameTe: 'కామవరపుకోట (గుంటుపల్లి బౌద్ధ గుహలు)', lat: 16.95, lon: 81.19 }
      ]},
      { id: 't_narasapuram', name: 'T.Narasapuram', nameTe: 'టి.నరసాపురం', lgdCode: 4972, lat: 17.14, lon: 81.14, villages: [
        { name: 'T.Narasapuram HQ', nameTe: 'టి.నరసాపురం', lat: 17.14, lon: 81.14 }
      ]},
      { id: 'polavaram', name: 'Polavaram', nameTe: 'పోలవరం', lgdCode: 4973, lat: 17.25, lon: 81.64, villages: [
        { name: 'Polavaram Project Site', nameTe: 'పోలవరం ప్రాజెక్ట్ గ్రామం', lat: 17.25, lon: 81.64 },
        { name: 'Singanapalli', nameTe: 'సింగనపల్లి', lat: 17.23, lon: 81.66 }
      ]},
      { id: 'buttayagudem', name: 'Buttayagudem', nameTe: 'బుట్టాయగూడెం', lgdCode: 4974, lat: 17.16, lon: 81.31, villages: [
        { name: 'Buttayagudem Tribal HQ', nameTe: 'బుట్టాయగూడెం', lat: 17.16, lon: 81.31 }
      ]},
      { id: 'jeelugumilli', name: 'Jeelugumilli', nameTe: 'జీలుగుమిల్లి', lgdCode: 4975, lat: 17.19, lon: 81.15, villages: [
        { name: 'Jeelugumilli HQ', nameTe: 'జీలుగుమిల్లి', lat: 17.19, lon: 81.15 }
      ]},
      { id: 'koyyalagudem', name: 'Koyyalagudem', nameTe: 'కొయ్యలగూడెం', lgdCode: 4976, lat: 17.12, lon: 81.30, villages: [
        { name: 'Koyyalagudem Town', nameTe: 'కొయ్యలగూడెం టౌన్', lat: 17.12, lon: 81.30 },
        { name: 'Bayyanagudem', nameTe: 'బయ్యనగూడెం', lat: 17.14, lon: 81.28 }
      ]},
      { id: 'kukunoor', name: 'Kukunoor', nameTe: 'కూకునూరు', lgdCode: 4977, lat: 17.58, lon: 81.18, villages: [
        { name: 'Kukunoor HQ', nameTe: 'కూకునూరు', lat: 17.58, lon: 81.18 }
      ]},
      { id: 'velairpadu', name: 'Velairpadu', nameTe: 'వేలేరుపాడు', lgdCode: 4978, lat: 17.52, lon: 81.33, villages: [
        { name: 'Velairpadu HQ', nameTe: 'వేలేరుపాడు', lat: 17.52, lon: 81.33 }
      ]},
      { id: 'nuzvid', name: 'Nuzvid', nameTe: 'నూజివీడు', lgdCode: 4979, lat: 16.79, lon: 80.85, villages: [
        { name: 'Nuzvid (Banganapalle Mango Hub)', nameTe: 'నూజివీడు (రసాలు/బేనిషా మామిడి మార్కెట్)', lat: 16.79, lon: 80.85 },
        { name: 'IIIT Nuzvid Campus', nameTe: 'ట్రిపుల్ ఐటీ నూజివీడు', lat: 16.77, lon: 80.87 },
        { name: 'Borragudem', nameTe: 'బొర్రాగూడెం', lat: 16.81, lon: 80.83 }
      ]},
      { id: 'agiripalli', name: 'Agiripalli', nameTe: 'ఆగిరిపల్లి', lgdCode: 4980, lat: 16.68, lon: 80.80, villages: [
        { name: 'Agiripalli (Sobhanachala Swamy)', nameTe: 'ఆగిరిపల్లి శోభనాచల క్షేత్రం', lat: 16.68, lon: 80.80 }
      ]},
      { id: 'chatrai', name: 'Chatrai', nameTe: 'చాట్రాయి', lgdCode: 4981, lat: 16.99, lon: 80.88, villages: [
        { name: 'Chatrai HQ', nameTe: 'చాట్రాయి', lat: 16.99, lon: 80.88 }
      ]},
      { id: 'musunuru', name: 'Musunuru', nameTe: 'ముసునూరు', lgdCode: 4982, lat: 16.85, lon: 80.95, villages: [
        { name: 'Musunuru HQ', nameTe: 'ముసునూరు', lat: 16.85, lon: 80.95 }
      ]},
      { id: 'kaikalur', name: 'Kaikalur', nameTe: 'కైకలూరు', lgdCode: 4983, lat: 16.56, lon: 81.21, villages: [
        { name: 'Kaikalur Town (Aqua & Kolleru Lake)', nameTe: 'కైకలూరు (కొల్లేరు ఆక్వా హబ్)', lat: 16.56, lon: 81.21 },
        { name: 'Atapaka Bird Sanctuary Vill', nameTe: 'ఆటపాక పక్షుల కేంద్రం', lat: 16.54, lon: 81.23 }
      ]},
      { id: 'kalidindi', name: 'Kalidindi', nameTe: 'కలిదిండి', lgdCode: 4984, lat: 16.50, lon: 81.30, villages: [
        { name: 'Kalidindi HQ', nameTe: 'కలిదిండి', lat: 16.50, lon: 81.30 }
      ]},
      { id: 'mandavalli', name: 'Mandavalli', nameTe: 'మండవల్లి', lgdCode: 4985, lat: 16.60, lon: 81.16, villages: [
        { name: 'Mandavalli HQ', nameTe: 'మండవల్లి', lat: 16.60, lon: 81.16 }
      ]},
      { id: 'mudinepalli', name: 'Mudinepalli', nameTe: 'ముదినేపల్లి', lgdCode: 4986, lat: 16.48, lon: 81.13, villages: [
        { name: 'Mudinepalli HQ', nameTe: 'ముదినేపల్లి', lat: 16.48, lon: 81.13 }
      ]}
    ]
  },
  {
    id: 'guntur',
    name: 'Guntur',
    nameTe: 'గుంటూరు',
    lgdCode: 506,
    hq: 'Guntur',
    latitude: 16.3067,
    longitude: 80.4365,
    dominantSoil: 'black_cotton',
    soilDescTe: 'లోతైన నల్ల రేగడి మరియు కృష్ణా పశ్చిమ డెల్టా ఒండ్రు నేలలు (మిరప, పత్తి, పొగాకు)',
    soilDescEn: 'Deep black cotton soil (regur) and deltaic Krishna alluvium',
    commonCrops: ['Chilli', 'Cotton', 'Paddy', 'Tobacco', 'Turmeric', 'Maize'],
    commonCropsTe: ['మిరప', 'పత్తి', 'వరి', 'పొగాకు', 'పసుపు', 'మొక్కజొన్న'],
    mandals: [
      { id: 'guntur_east', name: 'Guntur East', nameTe: 'గుంటూరు తూర్పు', lgdCode: 5001, lat: 16.30, lon: 80.46, villages: [
        { name: 'Guntur Mirchi Yard (Asia Largest)', nameTe: 'గుంటూరు మిర్చి యార్డ్', lat: 16.29, lon: 80.45 },
        { name: 'Lalapet', nameTe: 'లాలాపేట', lat: 16.31, lon: 80.47 },
        { name: 'Autonagar Gnt', nameTe: 'ఆటోనగర్', lat: 16.28, lon: 80.48 }
      ]},
      { id: 'guntur_west', name: 'Guntur West', nameTe: 'గుంటూరు పశ్చిమ', lgdCode: 5002, lat: 16.31, lon: 80.41, villages: [
        { name: 'Pattabhipuram', nameTe: 'పట్టాభిపురం', lat: 16.31, lon: 80.41 },
        { name: 'Gujjanagundla', nameTe: 'గుజ్జనగుండ్ల', lat: 16.32, lon: 80.40 },
        { name: 'Gorantla Gnt', nameTe: 'గోరంట్ల', lat: 16.34, lon: 80.42 }
      ]},
      { id: 'tenali', name: 'Tenali', nameTe: 'తెనాలి', lgdCode: 5003, lat: 16.24, lon: 80.64, villages: [
        { name: 'Tenali Town (Andhra Paris)', nameTe: 'తెనాలి టౌన్', lat: 16.24, lon: 80.64 },
        { name: 'Angalakuduru', nameTe: 'అంగలకుదురు', lat: 16.25, lon: 80.62 },
        { name: 'Nandivelugu', nameTe: 'నందివెలుగు', lat: 16.27, lon: 80.61 },
        { name: 'Kolakaluru', nameTe: 'కొలకలూరు', lat: 16.28, lon: 80.60 },
        { name: 'Burripalem', nameTe: 'బుర్రిపాలెం', lat: 16.22, lon: 80.66 }
      ]},
      { id: 'mangalagiri', name: 'Mangalagiri', nameTe: 'మంగళగిరి', lgdCode: 5004, lat: 16.43, lon: 80.57, villages: [
        { name: 'Mangalagiri (Panakala Narasimha & Handlooms)', nameTe: 'మంగళగిరి (పానకాల స్వామి & చేనేత)', lat: 16.43, lon: 80.57 },
        { name: 'AIIMS Mangalagiri Campus', nameTe: 'ఎయిమ్స్ మంగళగిరి', lat: 16.44, lon: 80.55 },
        { name: 'Kaza (Toll Plaza)', nameTe: 'కాజా', lat: 16.40, lon: 80.56 },
        { name: 'Atmakuru Mgl', nameTe: 'ఆత్మకూరు', lat: 16.42, lon: 80.59 }
      ]},
      { id: 'tadepalli', name: 'Tadepalli', nameTe: 'తాడేపల్లి', lgdCode: 5005, lat: 16.48, lon: 80.60, villages: [
        { name: 'Tadepalli Town', nameTe: 'తాడేపల్లి టౌన్', lat: 16.48, lon: 80.60 },
        { name: 'Undavalli (Ancient Cave Temples)', nameTe: 'ఉండవల్లి గుహలు', lat: 16.49, lon: 80.58 },
        { name: 'Kunchanapalli Gnt', nameTe: 'కుంచనపల్లి', lat: 16.47, lon: 80.61 }
      ]},
      { id: 'tadikonda', name: 'Tadikonda', nameTe: 'తాడికొండ', lgdCode: 5006, lat: 16.42, lon: 80.45, villages: [
        { name: 'Tadikonda HQ', nameTe: 'తాడికొండ', lat: 16.42, lon: 80.45 },
        { name: 'Ponnekallu', nameTe: 'పొన్నెకల్లు', lat: 16.44, lon: 80.43 },
        { name: 'Kantheru', nameTe: 'కాంతేరు', lat: 16.41, lon: 80.47 }
      ]},
      { id: 'thullur', name: 'Thullur', nameTe: 'తుళ్లూరు', lgdCode: 5007, lat: 16.53, lon: 80.48, villages: [
        { name: 'Thullur (Amaravati Capital City Core)', nameTe: 'తుళ్లూరు (రాజధాని అమరావతి)', lat: 16.53, lon: 80.48 },
        { name: 'Velagapudi (AP Secretariat)', nameTe: 'వెలగపూడి (సచివాలయం)', lat: 16.51, lon: 80.52 },
        { name: 'Mandadam', nameTe: 'మందడం', lat: 16.50, lon: 80.54 },
        { name: 'Ainavolu Amaravati', nameTe: 'ఐనవోలు', lat: 16.52, lon: 80.50 }
      ]},
      { id: 'medikonduru', name: 'Medikonduru', nameTe: 'మేడికొండూరు', lgdCode: 5008, lat: 16.33, lon: 80.29, villages: [
        { name: 'Medikonduru HQ', nameTe: 'మేడికొండూరు', lat: 16.33, lon: 80.29 },
        { name: 'Perecherla Junction', nameTe: 'పేరేచర్ల జంక్షన్', lat: 16.32, lon: 80.34 }
      ]},
      { id: 'phirangipuram', name: 'Phirangipuram', nameTe: 'ఫిరంగిపురం', lgdCode: 5009, lat: 16.29, lon: 80.24, villages: [
        { name: 'Phirangipuram (Mary Matha Hill Shrine)', nameTe: 'ఫిరంగిపురం', lat: 16.29, lon: 80.24 },
        { name: 'Siripuram', nameTe: 'సిరిపురం', lat: 16.27, lon: 80.26 }
      ]},
      { id: 'pedakakani', name: 'Pedakakani', nameTe: 'పెదకాకాని', lgdCode: 5010, lat: 16.35, lon: 80.49, villages: [
        { name: 'Pedakakani (Mallikarjuna Swamy)', nameTe: 'పెదకాకాని శివక్షేత్రం', lat: 16.35, lon: 80.49 },
        { name: 'Namburu (Acharya Nagarjuna Univ)', nameTe: 'నంబూరు (యూనివర్సిటీ క్యాంపస్)', lat: 16.37, lon: 80.52 }
      ]},
      { id: 'pedanandipadu', name: 'Pedanandipadu', nameTe: 'పెదనందిపాడు', lgdCode: 5011, lat: 16.08, lon: 80.32, villages: [
        { name: 'Pedanandipadu HQ', nameTe: 'పెదనందిపాడు', lat: 16.08, lon: 80.32 },
        { name: 'Palaparru', nameTe: 'పాలపర్రు', lat: 16.06, lon: 80.34 }
      ]},
      { id: 'vatticherukuru', name: 'Vatticherukuru', nameTe: 'వట్టిచెరుకూరు', lgdCode: 5012, lat: 16.22, lon: 80.43, villages: [
        { name: 'Vatticherukuru HQ', nameTe: 'వట్టిచెరుకూరు', lat: 16.22, lon: 80.43 },
        { name: 'Kornepadu', nameTe: 'కోర్నెపాడు', lat: 16.24, lon: 80.41 }
      ]},
      { id: 'prathipadu_gnt', name: 'Prathipadu', nameTe: 'ప్రత్తిపాడు', lgdCode: 5013, lat: 16.18, lon: 80.34, villages: [
        { name: 'Prathipadu HQ', nameTe: 'ప్రత్తిపాడు', lat: 16.18, lon: 80.34 },
        { name: 'Gottipadu', nameTe: 'గొట్టిపాడు', lat: 16.16, lon: 80.36 }
      ]},
      { id: 'ponnur', name: 'Ponnur', nameTe: 'పొన్నూరు', lgdCode: 5014, lat: 16.07, lon: 80.56, villages: [
        { name: 'Ponnur (Bhavanarayana Swamy)', nameTe: 'పొన్నూరు క్షేత్రం', lat: 16.07, lon: 80.56 },
        { name: 'Nidubrolu', nameTe: 'నిడుబ్రోలు', lat: 16.06, lon: 80.54 },
        { name: 'Machavaram Pnr', nameTe: 'మాచవరం', lat: 16.09, lon: 80.58 }
      ]},
      { id: 'chebrolu_gnt', name: 'Chebrolu', nameTe: 'చేబ్రోలు', lgdCode: 5015, lat: 16.20, lon: 80.53, villages: [
        { name: 'Chebrolu (Chaturmukha Brahma Temple)', nameTe: 'చేబ్రోలు (చతుర్ముఖ బ్రహ్మ క్షేత్రం)', lat: 16.20, lon: 80.53 },
        { name: 'Vadlamudi (VFSTR University)', nameTe: 'వడ్లమూడి', lat: 16.23, lon: 80.55 }
      ]},
      { id: 'kakumanu', name: 'Kakumanu', nameTe: 'కాకుమాను', lgdCode: 5016, lat: 16.04, lon: 80.40, villages: [
        { name: 'Kakumanu HQ', nameTe: 'కాకుమాను', lat: 16.04, lon: 80.40 }
      ]},
      { id: 'vemuru', name: 'Vemuru', nameTe: 'వేమూరు', lgdCode: 5017, lat: 16.19, lon: 80.74, villages: [
        { name: 'Vemuru HQ', nameTe: 'వేమూరు', lat: 16.19, lon: 80.74 },
        { name: 'Chavali', nameTe: 'చావలి', lat: 16.17, lon: 80.76 }
      ]},
      { id: 'kollur', name: 'Kollur', nameTe: 'కొల్లూరు', lgdCode: 5018, lat: 16.18, lon: 80.80, villages: [
        { name: 'Kollur HQ', nameTe: 'కొల్లూరు', lat: 16.18, lon: 80.80 },
        { name: 'Ananthavaram', nameTe: 'అనంతవరం', lat: 16.20, lon: 80.78 }
      ]}
    ]
  },
  {
    id: 'kakinada',
    name: 'Kakinada',
    nameTe: 'కాకినాడ',
    lgdCode: 747,
    hq: 'Kakinada',
    latitude: 16.9891,
    longitude: 82.2475,
    dominantSoil: 'coastal_alluvium',
    soilDescTe: 'సముద్ర తీర సారవంతమైన ఒండ్రు నేలలు (కాకినాడ కాజా మరియు పోర్ట్ వాణిజ్యం)',
    soilDescEn: 'Fertile coastal alluvium and deltaic river loams',
    commonCrops: ['Paddy', 'Aqua/Shrimp', 'Coconut', 'Sugarcane', 'Banana', 'Oil Palm'],
    commonCropsTe: ['వరి', 'ఆక్వా కల్చర్', 'కొబ్బరి', 'చెరకు', 'అరటి', 'ఆయిల్ పామ్'],
    mandals: [
      { id: 'kakinada_urban', name: 'Kakinada Urban', nameTe: 'కాకినాడ అర్బన్', lgdCode: 4871, lat: 16.99, lon: 82.25, villages: [
        { name: 'Kakinada Deepwater Port', nameTe: 'కాకినాడ పోర్ట్ ఏరియా', lat: 16.98, lon: 82.27 },
        { name: 'Suryaraopeta Kkd', nameTe: 'సూర్యారావుపేట', lat: 16.97, lon: 82.24 }
      ]},
      { id: 'kakinada_rural', name: 'Kakinada Rural', nameTe: 'కాకినాడ రూరల్', lgdCode: 4872, lat: 17.02, lon: 82.23, villages: [
        { name: 'Sarpavaram (Bhavanarayana Swamy)', nameTe: 'సర్పవరం క్షేత్రం', lat: 17.02, lon: 82.23 },
        { name: 'Ramanayyapeta', nameTe: 'రమణయ్యపేట', lat: 17.00, lon: 82.22 },
        { name: 'Thimmapuram Kkd', nameTe: 'తిమ్మాపురం', lat: 17.04, lon: 82.26 }
      ]},
      { id: 'samalkota', name: 'Samalkota', nameTe: 'సామర్లకోట', lgdCode: 4873, lat: 17.05, lon: 82.17, villages: [
        { name: 'Samalkota (Kumararama Bhimeswara)', nameTe: 'సామర్లకోట (పంచారామ క్షేత్రం)', lat: 17.05, lon: 82.17 },
        { name: 'Madhavapatnam', nameTe: 'మాధవపట్నం', lat: 17.03, lon: 82.19 }
      ]},
      { id: 'pithapuram', name: 'Pithapuram', nameTe: 'పిఠాపురం', lgdCode: 4874, lat: 17.11, lon: 82.26, villages: [
        { name: 'Pithapuram (Pada Gaya & Kukkuteswara)', nameTe: 'పిఠాపురం పాదగయ క్షేత్రం', lat: 17.11, lon: 82.26 },
        { name: 'Virava', nameTe: 'విరవ', lat: 17.13, lon: 82.24 },
        { name: 'Chitrada', nameTe: 'చిత్రాడ', lat: 17.09, lon: 82.28 }
      ]},
      { id: 'gollaprolu', name: 'Gollaprolu', nameTe: 'గొల్లప్రోలు', lgdCode: 4875, lat: 17.15, lon: 82.28, villages: [
        { name: 'Gollaprolu HQ', nameTe: 'గొల్లప్రోలు', lat: 17.15, lon: 82.28 },
        { name: 'Chebrolu Kkd', nameTe: 'చేబ్రోలు', lat: 17.17, lon: 82.26 }
      ]},
      { id: 'peddapuram', name: 'Peddapuram', nameTe: 'పెద్దాపురం', lgdCode: 4876, lat: 17.08, lon: 82.14, villages: [
        { name: 'Peddapuram Town (Silk & Rice Trade)', nameTe: 'పెద్దాపురం టౌన్', lat: 17.08, lon: 82.14 },
        { name: 'Divili', nameTe: 'దివిలి', lat: 17.11, lon: 82.12 },
        { name: 'Kandamuru', nameTe: 'కండమూరు', lat: 17.06, lon: 82.16 }
      ]},
      { id: 'jaggampeta', name: 'Jaggampeta', nameTe: 'జగ్గంపేట', lgdCode: 4877, lat: 17.17, lon: 82.05, villages: [
        { name: 'Jaggampeta Commercial Centre', nameTe: 'జగ్గంపేట', lat: 17.17, lon: 82.05 },
        { name: 'Ramavaram Jgp', nameTe: 'రామవరం', lat: 17.19, lon: 82.07 }
      ]},
      { id: 'gandepalli', name: 'Gandepalli', nameTe: 'గండేపల్లి', lgdCode: 4878, lat: 17.15, lon: 81.98, villages: [
        { name: 'Gandepalli HQ', nameTe: 'గండేపల్లి', lat: 17.15, lon: 81.98 }
      ]},
      { id: 'kirlampudi', name: 'Kirlampudi', nameTe: 'కిర్లంపూడి', lgdCode: 4879, lat: 17.10, lon: 82.08, villages: [
        { name: 'Kirlampudi HQ', nameTe: 'కిర్లంపూడి', lat: 17.10, lon: 82.08 }
      ]},
      { id: 'tuni', name: 'Tuni', nameTe: 'తుని', lgdCode: 4880, lat: 17.35, lon: 82.55, villages: [
        { name: 'Tuni Town (Betel Leaves & Cashew)', nameTe: 'తుని (తమలపాకుల మార్కెట్)', lat: 17.35, lon: 82.55 },
        { name: 'Hamsavaram', nameTe: 'హంసవరం', lat: 17.38, lon: 82.53 },
        { name: 'Talupulamma Lova Shrine', nameTe: 'తలపులమ్మ లోవ క్షేత్రం', lat: 17.40, lon: 82.49 }
      ]},
      { id: 'kotananduru', name: 'Kotananduru', nameTe: 'కోటనందూరు', lgdCode: 4881, lat: 17.41, lon: 82.43, villages: [
        { name: 'Kotananduru HQ', nameTe: 'కోటనందూరు', lat: 17.41, lon: 82.43 }
      ]},
      { id: 'thondangi', name: 'Thondangi', nameTe: 'తొండంగి', lgdCode: 4882, lat: 17.27, lon: 82.46, villages: [
        { name: 'Thondangi HQ', nameTe: 'తొండంగి', lat: 17.27, lon: 82.46 },
        { name: 'Annavaram Hill Shrine', nameTe: 'అన్నవరం సత్యనారాయణ స్వామి క్షేత్రం', lat: 17.28, lon: 82.40 }
      ]},
      { id: 'prathipadu_kkd', name: 'Prathipadu (Kakinada)', nameTe: 'ప్రత్తిపాడు', lgdCode: 4883, lat: 17.23, lon: 82.19, villages: [
        { name: 'Prathipadu HQ', nameTe: 'ప్రత్తిపాడు', lat: 17.23, lon: 82.19 },
        { name: 'Dharmavaram Kkd', nameTe: 'ధర్మవరం', lat: 17.21, lon: 82.21 }
      ]},
      { id: 'sankhavaram', name: 'Sankhavaram', nameTe: 'శంఖవరం', lgdCode: 4884, lat: 17.29, lon: 82.28, villages: [
        { name: 'Sankhavaram HQ', nameTe: 'శంఖవరం', lat: 17.29, lon: 82.28 }
      ]},
      { id: 'yeleswaram', name: 'Yeleswaram', nameTe: 'ఏలేశ్వరం', lgdCode: 4885, lat: 17.28, lon: 82.08, villages: [
        { name: 'Yeleswaram Reservoir Town', nameTe: 'ఏలేశ్వరం జలాశయం', lat: 17.28, lon: 82.08 }
      ]},
      { id: 'rowthulapudi', name: 'Rowthulapudi', nameTe: 'రౌతులపూడి', lgdCode: 4886, lat: 17.38, lon: 82.35, villages: [
        { name: 'Rowthulapudi HQ', nameTe: 'రౌతులపూడి', lat: 17.38, lon: 82.35 }
      ]},
      { id: 'karapa', name: 'Karapa', nameTe: 'కరప', lgdCode: 4887, lat: 16.89, lon: 82.21, villages: [
        { name: 'Karapa HQ', nameTe: 'కరప', lat: 16.89, lon: 82.21 },
        { name: 'Gorripudi', nameTe: 'గొర్రిపూడి', lat: 16.87, lon: 82.23 }
      ]},
      { id: 'u_kothapalli', name: 'U.Kothapalli', nameTe: 'యు.కొత్తపల్లి', lgdCode: 4888, lat: 17.18, lon: 82.34, villages: [
        { name: 'U.Kothapalli Beach HQ', nameTe: 'యు.కొత్తపల్లి', lat: 17.18, lon: 82.34 },
        { name: 'Uppada (Uppada Silk Sarees & Beach)', nameTe: 'ఉప్పాడ జాందాని చీరల గ్రామం', lat: 17.08, lon: 82.33 }
      ]},
      { id: 'kajuluru', name: 'Kajuluru', nameTe: 'కాజులూరు', lgdCode: 4889, lat: 16.81, lon: 82.16, villages: [
        { name: 'Kajuluru HQ', nameTe: 'కాజులూరు', lat: 16.81, lon: 82.16 }
      ]}
    ]
  },
  {
    id: 'krishna',
    name: 'Krishna',
    nameTe: 'కృష్ణా',
    lgdCode: 510,
    hq: 'Machilipatnam',
    latitude: 16.1875,
    longitude: 81.1389,
    dominantSoil: 'deltaic_alluvium',
    soilDescTe: 'సారవంతమైన కృష్ణా డెల్టా ఒండ్రు నేలలు మరియు తీరప్రాంత క్లే నేలలు (ఆంధ్రా ధాన్యాగారం)',
    soilDescEn: 'Fertile Krishna deltaic clay alluvium and coastal saline soils',
    commonCrops: ['Paddy', 'Fish/Prawn Culture', 'Black Gram', 'Sugarcane', 'Banana', 'Mango'],
    commonCropsTe: ['వరి', 'ఆక్వా కల్చర్', 'మినుములు', 'చెరకు', 'అరటి', 'మామిడి'],
    mandals: [
      { id: 'machilipatnam', name: 'Machilipatnam', nameTe: 'మచిలీపట్నం', lgdCode: 5092, lat: 16.19, lon: 81.14, villages: [
        { name: 'Machilipatnam Port Town (Bandar)', nameTe: 'మచిలీపట్నం (బందరు లడ్డు ప్రసిద్ధి)', lat: 16.19, lon: 81.14 },
        { name: 'Manginapudi Beach Village', nameTe: 'మంగినపూడి బీచ్', lat: 16.22, lon: 81.19 },
        { name: 'Chilakalapudi', nameTe: 'చిలకలపూడి (బందరు రోల్డ్ గోల్డ్ హబ్)', lat: 16.20, lon: 81.12 },
        { name: 'Pothepalli', nameTe: 'పోతేపల్లి', lat: 16.17, lon: 81.15 }
      ]},
      { id: 'pedana', name: 'Pedana', nameTe: 'పెడన', lgdCode: 5093, lat: 16.26, lon: 81.14, villages: [
        { name: 'Pedana (Kalamkari Handblock Printing Hub)', nameTe: 'పెడన కలంకారీ కేంద్రం', lat: 16.26, lon: 81.14 },
        { name: 'Balliparru', nameTe: 'బల్లిపర్రు', lat: 16.28, lon: 81.12 },
        { name: 'Kuduru', nameTe: 'కూడురు', lat: 16.24, lon: 81.16 }
      ]},
      { id: 'guduru_krishna', name: 'Guduru (Krishna)', nameTe: 'గూడూరు', lgdCode: 5094, lat: 16.18, lon: 81.04, villages: [
        { name: 'Guduru HQ', nameTe: 'గూడూరు', lat: 16.18, lon: 81.04 }
      ]},
      { id: 'kruthivennu', name: 'Kruthivennu', nameTe: 'కృత్తివెన్ను', lgdCode: 5095, lat: 16.32, lon: 81.28, villages: [
        { name: 'Kruthivennu Aqua Zone', nameTe: 'కృత్తివెన్ను', lat: 16.32, lon: 81.28 }
      ]},
      { id: 'bantumilli', name: 'Bantumilli', nameTe: 'బంటుమిల్లి', lgdCode: 5096, lat: 16.35, lon: 81.22, villages: [
        { name: 'Bantumilli HQ', nameTe: 'బంటుమిల్లి', lat: 16.35, lon: 81.22 }
      ]},
      { id: 'avanigadda', name: 'Avanigadda', nameTe: 'అవనిగడ్డ', lgdCode: 5097, lat: 16.02, lon: 80.92, villages: [
        { name: 'Avanigadda Town (Diviseema)', nameTe: 'అవనిగడ్డ (దివిసీమ)', lat: 16.02, lon: 80.92 },
        { name: 'Puligadda Bridge Village', nameTe: 'పులిగడ్డ', lat: 16.05, lon: 80.89 }
      ]},
      { id: 'nagayalanka', name: 'Nagayalanka', nameTe: 'నాగాయలంక', lgdCode: 5098, lat: 15.95, lon: 80.91, villages: [
        { name: 'Nagayalanka (Krishna Confluence Point)', nameTe: 'నాగాయలంక', lat: 15.95, lon: 80.91 },
        { name: 'Sorlagondi', nameTe: 'సొర్లగొంది', lat: 15.88, lon: 80.95 }
      ]},
      { id: 'koduru_krishna', name: 'Koduru (Krishna)', nameTe: 'కోడూరు', lgdCode: 5099, lat: 15.99, lon: 81.02, villages: [
        { name: 'Koduru Beach HQ', nameTe: 'కోడూరు', lat: 15.99, lon: 81.02 }
      ]},
      { id: 'challapalli', name: 'Challapalli', nameTe: 'చల్లపల్లి', lgdCode: 5100, lat: 16.11, lon: 80.93, villages: [
        { name: 'Challapalli Raja Palace Town', nameTe: 'చల్లపల్లి', lat: 16.11, lon: 80.93 }
      ]},
      { id: 'mopidevi', name: 'Mopidevi', nameTe: 'మోపిదేవి', lgdCode: 5101, lat: 16.08, lon: 80.93, villages: [
        { name: 'Mopidevi (Subrahmanyeswara Swamy Temple)', nameTe: 'మోపిదేవి సుబ్రహ్మణ్య క్షేత్రం', lat: 16.08, lon: 80.93 }
      ]},
      { id: 'ghantasala', name: 'Ghantasala', nameTe: 'ఘంటసాల', lgdCode: 5102, lat: 16.16, lon: 80.93, villages: [
        { name: 'Ghantasala (Historic Buddhist Centre)', nameTe: 'ఘంటసాల బౌద్ధ క్షేత్రం', lat: 16.16, lon: 80.93 }
      ]},
      { id: 'pamarru', name: 'Pamarru', nameTe: 'పామర్రు', lgdCode: 5103, lat: 16.33, lon: 80.96, villages: [
        { name: 'Pamarru Junction', nameTe: 'పామర్రు జంక్షన్', lat: 16.33, lon: 80.96 },
        { name: 'Kurumaddali', nameTe: 'కురుమద్దాలి', lat: 16.35, lon: 80.94 }
      ]},
      { id: 'thotlavalluru', name: 'Thotlavalluru', nameTe: 'తోట్లవల్లూరు', lgdCode: 5104, lat: 16.30, lon: 80.82, villages: [
        { name: 'Thotlavalluru HQ', nameTe: 'తోట్లవల్లూరు', lat: 16.30, lon: 80.82 }
      ]},
      { id: 'pamidimukkala', name: 'Pamidimukkala', nameTe: 'పామిడిముక్కల', lgdCode: 5105, lat: 16.27, lon: 80.88, villages: [
        { name: 'Pamidimukkala HQ', nameTe: 'పామిడిముక్కల', lat: 16.27, lon: 80.88 }
      ]},
      { id: 'movva', name: 'Movva', nameTe: 'మొవ్వ', lgdCode: 5106, lat: 16.23, lon: 80.91, villages: [
        { name: 'Movva (Kshetrayya Birthplace)', nameTe: 'మొవ్వ క్షేత్రం', lat: 16.23, lon: 80.91 },
        { name: 'Kuchipudi (World Classical Dance Birthplace)', nameTe: 'కూచిపూడి నృత్య గ్రామం', lat: 16.21, lon: 80.93 }
      ]},
      { id: 'gudivada', name: 'Gudivada', nameTe: 'గుడివాడ', lgdCode: 5107, lat: 16.44, lon: 80.99, villages: [
        { name: 'Gudivada Town (Rice Mills & Engineering)', nameTe: 'గుడివాడ టౌన్', lat: 16.44, lon: 80.99 },
        { name: 'Valivartipadu', nameTe: 'వలివర్తిపాడు', lat: 16.46, lon: 80.97 },
        { name: 'Billapadu', nameTe: 'బిల్లాపాడు', lat: 16.42, lon: 81.01 }
      ]},
      { id: 'gudlavalleru', name: 'Gudlavalleru', nameTe: 'గుడ్లవల్లేరు', lgdCode: 5108, lat: 16.35, lon: 81.05, villages: [
        { name: 'Gudlavalleru Engineering Campus', nameTe: 'గుడ్లవల్లేరు', lat: 16.35, lon: 81.05 }
      ]},
      { id: 'nandivada', name: 'Nandivada', nameTe: 'నందివాడ', lgdCode: 5109, lat: 16.49, lon: 81.02, villages: [
        { name: 'Nandivada HQ', nameTe: 'నందివాడ', lat: 16.49, lon: 81.02 }
      ]},
      { id: 'pedaparupudi', name: 'Pedaparupudi', nameTe: 'పెదపారుపూడి', lgdCode: 5110, lat: 16.40, lon: 80.90, villages: [
        { name: 'Pedaparupudi HQ', nameTe: 'పెదపారుపూడి', lat: 16.40, lon: 80.90 }
      ]},
      { id: 'penamaluru', name: 'Penamaluru', nameTe: 'పెనమలూరు', lgdCode: 5111, lat: 16.47, lon: 80.68, villages: [
        { name: 'Penamaluru HQ', nameTe: 'పెనమలూరు', lat: 16.47, lon: 80.68 },
        { name: 'Poranki', nameTe: 'పోరంకి', lat: 16.49, lon: 80.70 },
        { name: 'Gosala', nameTe: 'గోసాల', lat: 16.45, lon: 80.72 }
      ]},
      { id: 'kankipadu', name: 'Kankipadu', nameTe: 'కంకిపాడు', lgdCode: 5112, lat: 16.42, lon: 80.77, villages: [
        { name: 'Kankipadu Town', nameTe: 'కంకిపాడు టౌన్', lat: 16.42, lon: 80.77 },
        { name: 'Punadipadu', nameTe: 'పునాదిపాడు', lat: 16.44, lon: 80.75 }
      ]},
      { id: 'vuyyuru', name: 'Vuyyuru', nameTe: 'వుయ్యూరు', lgdCode: 5113, lat: 16.36, lon: 80.84, villages: [
        { name: 'Vuyyuru (K.C.P Sugar Factory Hub)', nameTe: 'వుయ్యూరు షుగర్ ఫ్యాక్టరీ', lat: 16.36, lon: 80.84 },
        { name: 'Katuru', nameTe: 'కాటూరు', lat: 16.38, lon: 80.82 }
      ]},
      { id: 'gannavaram_krishna', name: 'Gannavaram', nameTe: 'గన్నవరం', lgdCode: 5114, lat: 16.53, lon: 80.80, villages: [
        { name: 'Gannavaram Airport Area', nameTe: 'గన్నవరం విమానాశ్రయం', lat: 16.53, lon: 80.80 },
        { name: 'Veeravalli', nameTe: 'వీరవల్లి', lat: 16.55, lon: 80.83 },
        { name: 'Telaprolu', nameTe: 'తేలప్రోలు', lat: 16.57, lon: 80.86 }
      ]},
      { id: 'bapulapadu', name: 'Bapulapadu', nameTe: 'బాపులపాడు', lgdCode: 5115, lat: 16.63, lon: 80.87, villages: [
        { name: 'Hanuman Junction', nameTe: 'హనుమాన్ జంక్షన్', lat: 16.63, lon: 80.87 }
      ]}
    ]
  },
  {
    id: 'kurnool',
    name: 'Kurnool',
    nameTe: 'కర్నూలు',
    lgdCode: 511,
    hq: 'Kurnool',
    latitude: 15.8281,
    longitude: 78.0373,
    dominantSoil: 'black_cotton',
    soilDescTe: 'లోతైన నల్ల రేగడి నేలలు మరియు తుంగభద్ర నదీ పరీవాహక ప్రాంతం (పత్తి, వేరుశనగ, ఉల్లి)',
    soilDescEn: 'Deep black cotton soil and Tungabhadra river valley loams',
    commonCrops: ['Cotton', 'Groundnut', 'Onion', 'Paddy', 'Sunflower', 'Jowar'],
    commonCropsTe: ['పత్తి', 'వేరుశనగ', 'ఉల్లి', 'వరి', 'పొద్దుతిరుగుడు', 'జొన్నలు'],
    mandals: [
      { id: 'kurnool_urban', name: 'Kurnool Urban', nameTe: 'కర్నూలు అర్బన్', lgdCode: 4987, lat: 15.83, lon: 78.04, villages: [
        { name: 'Konda Reddy Buruju City', nameTe: 'కొండారెడ్డి బురుజు నడిబొడ్డు', lat: 15.83, lon: 78.04 },
        { name: 'Joharapuram', nameTe: 'జోహరాపురం', lat: 15.81, lon: 78.02 }
      ]},
      { id: 'kurnool_rural', name: 'Kurnool Rural', nameTe: 'కర్నూలు రూరల్', lgdCode: 4988, lat: 15.80, lon: 78.07, villages: [
        { name: 'Nannur', nameTe: 'నన్నూరు', lat: 15.82, lon: 78.10 },
        { name: 'Mamidalapadu', nameTe: 'మామిడాలపాడు', lat: 15.85, lon: 78.08 }
      ]},
      { id: 'kallur', name: 'Kallur', nameTe: 'కల్లూరు', lgdCode: 4989, lat: 15.81, lon: 78.01, villages: [
        { name: 'Kallur Industrial Estate', nameTe: 'కల్లూరు', lat: 15.81, lon: 78.01 }
      ]},
      { id: 'orvakal', name: 'Orvakal', nameTe: 'ఓర్వకల్లు', lgdCode: 4990, lat: 15.68, lon: 78.22, villages: [
        { name: 'Orvakal Rock Garden & Airport', nameTe: 'ఓర్వకల్లు రాక్ గార్డెన్ & ఎయిర్‌పోర్ట్', lat: 15.68, lon: 78.22 },
        { name: 'Gargeyapuram', nameTe: 'గార్గెయపురం', lat: 15.71, lon: 78.19 }
      ]},
      { id: 'c_belagal', name: 'C.Belagal', nameTe: 'సి.బెళగల్', lgdCode: 4991, lat: 15.91, lon: 77.84, villages: [
        { name: 'C.Belagal HQ', nameTe: 'సి.బెళగల్', lat: 15.91, lon: 77.84 }
      ]},
      { id: 'gudur_knl', name: 'Gudur (Kurnool)', nameTe: 'గూడూరు', lgdCode: 4992, lat: 15.75, lon: 77.78, villages: [
        { name: 'Gudur HQ', nameTe: 'గూడూరు', lat: 15.75, lon: 77.78 }
      ]},
      { id: 'kodumur', name: 'Kodumur', nameTe: 'కోడుమూరు', lgdCode: 4993, lat: 15.68, lon: 77.78, villages: [
        { name: 'Kodumur Town', nameTe: 'కోడుమూరు టౌన్', lat: 15.68, lon: 77.78 }
      ]},
      { id: 'veldurthi', name: 'Veldurthi', nameTe: 'వెల్దుర్తి', lgdCode: 4994, lat: 15.58, lon: 77.92, villages: [
        { name: 'Veldurthi Iron Ore Zone', nameTe: 'వెల్దుర్తి', lat: 15.58, lon: 77.92 }
      ]},
      { id: 'adoni', name: 'Adoni', nameTe: 'ఆదోని', lgdCode: 4995, lat: 15.63, lon: 77.27, villages: [
        { name: 'Adoni Town (Asia Famous Cotton Mandi)', nameTe: 'ఆదోని (పత్తి మార్కెట్ యార్డ్)', lat: 15.63, lon: 77.27 },
        { name: 'Isvi', nameTe: 'ఇస్వి', lat: 15.66, lon: 77.24 },
        { name: 'Mandagiri', nameTe: 'మందగిరి', lat: 15.61, lon: 77.29 }
      ]},
      { id: 'holagunda', name: 'Holagunda', nameTe: 'హోళగుంద', lgdCode: 4996, lat: 15.48, lon: 77.03, villages: [
        { name: 'Holagunda HQ', nameTe: 'హోళగుంద', lat: 15.48, lon: 77.03 }
      ]},
      { id: 'yemmiganur', name: 'Yemmiganur', nameTe: 'ఎమ్మిగనూరు', lgdCode: 4997, lat: 15.73, lon: 77.48, villages: [
        { name: 'Yemmiganur Weavers Town', nameTe: 'ఎమ్మిగనూరు (చేనేత నగరం)', lat: 15.73, lon: 77.48 },
        { name: 'Banavasi Agri Farm', nameTe: 'బనవాసి వ్యవసాయ క్షేత్రం', lat: 15.71, lon: 77.50 },
        { name: 'Nandavaram Road Vill', nameTe: 'నందవరం రోడ్డు', lat: 15.75, lon: 77.46 }
      ]},
      { id: 'nandavaram', name: 'Nandavaram', nameTe: 'నందవరం', lgdCode: 4998, lat: 15.79, lon: 77.52, villages: [
        { name: 'Nandavaram (Chowdeswari Temple)', nameTe: 'నందవరం చౌడేశ్వరి క్షేత్రం', lat: 15.79, lon: 77.52 }
      ]},
      { id: 'mantralayam', name: 'Mantralayam', nameTe: 'మంత్రాలయం', lgdCode: 4999, lat: 15.94, lon: 77.43, villages: [
        { name: 'Mantralayam (Sri Raghavendra Swamy Matham)', nameTe: 'మంత్రాలయం రాఘవేంద్ర స్వామి క్షేత్రం', lat: 15.94, lon: 77.43 },
        { name: 'Madhavaram Mtl', nameTe: 'మాధవరం', lat: 15.91, lon: 77.45 }
      ]},
      { id: 'kosigi', name: 'Kosigi', nameTe: 'కోసిగి', lgdCode: 5000, lat: 15.85, lon: 77.27, villages: [
        { name: 'Kosigi HQ', nameTe: 'కోసిగి', lat: 15.85, lon: 77.27 }
      ]},
      { id: 'kowthalam', name: 'Kowthalam', nameTe: 'కౌతాళం', lgdCode: 5001, lat: 15.73, lon: 77.16, villages: [
        { name: 'Kowthalam HQ', nameTe: 'కౌతాళం', lat: 15.73, lon: 77.16 }
      ]},
      { id: 'peddakadubur', name: 'Peddakadubur', nameTe: 'పెద్దకడబూరు', lgdCode: 5002, lat: 15.78, lon: 77.34, villages: [
        { name: 'Peddakadubur HQ', nameTe: 'పెద్దకడబూరు', lat: 15.78, lon: 77.34 }
      ]},
      { id: 'aspari', name: 'Aspari', nameTe: 'ఆస్పరి', lgdCode: 5003, lat: 15.48, lon: 77.42, villages: [
        { name: 'Aspari HQ', nameTe: 'ఆస్పరి', lat: 15.48, lon: 77.42 }
      ]},
      { id: 'alur', name: 'Alur', nameTe: 'ఆలూరు', lgdCode: 5004, lat: 15.31, lon: 77.24, villages: [
        { name: 'Alur Town', nameTe: 'ఆలూరు టౌన్', lat: 15.31, lon: 77.24 },
        { name: 'Halaharvi Border', nameTe: 'హాలహర్వి', lat: 15.33, lon: 77.21 }
      ]},
      { id: 'devanakonda', name: 'Devanakonda', nameTe: 'దేవనకొండ', lgdCode: 5005, lat: 15.54, lon: 77.56, villages: [
        { name: 'Devanakonda HQ', nameTe: 'దేవనకొండ', lat: 15.54, lon: 77.56 }
      ]},
      { id: 'chippagiri', name: 'Chippagiri', nameTe: 'చిప్పగిరి', lgdCode: 5006, lat: 15.30, lon: 77.39, villages: [
        { name: 'Chippagiri HQ', nameTe: 'చిప్పగిరి', lat: 15.30, lon: 77.39 }
      ]},
      { id: 'halaharvi', name: 'Halaharvi', nameTe: 'హాలహర్వి', lgdCode: 5007, lat: 15.32, lon: 77.11, villages: [
        { name: 'Halaharvi HQ', nameTe: 'హాలహర్వి', lat: 15.32, lon: 77.11 }
      ]},
      { id: 'pattikonda', name: 'Pattikonda', nameTe: 'పత్తికొండ', lgdCode: 5008, lat: 15.40, lon: 77.51, villages: [
        { name: 'Pattikonda Town', nameTe: 'పత్తికొండ టౌన్', lat: 15.40, lon: 77.51 },
        { name: 'Pandikona', nameTe: 'పందికోన', lat: 15.42, lon: 77.53 }
      ]},
      { id: 'maddikera_east', name: 'Maddikera (East)', nameTe: 'మద్దికెర', lgdCode: 5009, lat: 15.25, lon: 77.42, villages: [
        { name: 'Maddikera HQ', nameTe: 'మద్దికెర', lat: 15.25, lon: 77.42 }
      ]},
      { id: 'tuggali', name: 'Tuggali', nameTe: 'తుగ్గలి', lgdCode: 5010, lat: 15.35, lon: 77.62, villages: [
        { name: 'Jonnegiri (Gold Exploration Zone)', nameTe: 'జొన్నగిరి', lat: 15.34, lon: 77.60 },
        { name: 'Tuggali HQ', nameTe: 'తుగ్గలి', lat: 15.35, lon: 77.62 }
      ]},
      { id: 'krishnagiri', name: 'Krishnagiri', nameTe: 'కృష్ణగిరి', lgdCode: 5011, lat: 15.56, lon: 77.84, villages: [
        { name: 'Krishnagiri HQ', nameTe: 'కృష్ణగిరి', lat: 15.56, lon: 77.84 }
      ]},
      { id: 'gonegandla', name: 'Gonegandla', nameTe: 'గోనెగండ్ల', lgdCode: 5012, lat: 15.65, lon: 77.63, villages: [
        { name: 'Gonegandla HQ', nameTe: 'గోనెగండ్ల', lat: 15.65, lon: 77.63 }
      ]}
    ]
  },
  {
    id: 'nandyal',
    name: 'Nandyal',
    nameTe: 'నంద్యాల',
    lgdCode: 756,
    hq: 'Nandyal',
    latitude: 15.4882,
    longitude: 78.4836,
    dominantSoil: 'black_cotton',
    soilDescTe: 'సారవంతమైన నల్ల రేగడి నేలలు మరియు కుందు నదీ లోయ నేలలు (నవనందుల క్షేత్రం & శనగలు/వరి)',
    soilDescEn: 'Fertile black cotton soils and Kundu river basin plains',
    commonCrops: ['Bengal Gram', 'Paddy', 'Cotton', 'Sunflower', 'Maize', 'Banana'],
    commonCropsTe: ['శనగలు', 'వరి', 'పత్తి', 'పొద్దుతిరుగుడు', 'మొక్కజొన్న', 'అరటి'],
    mandals: [
      { id: 'nandyal_urban', name: 'Nandyal Urban', nameTe: 'నంద్యాల అర్బన్', lgdCode: 5013, lat: 15.49, lon: 78.48, villages: [
        { name: 'Nandyal Town (Rythu Nagar)', nameTe: 'నంద్యాల టౌన్ (రైతు నగర్)', lat: 15.49, lon: 78.48 },
        { name: 'Prathama Nandi Kshetram', nameTe: 'ప్రథమ నంది క్షేత్రం', lat: 15.50, lon: 78.47 }
      ]},
      { id: 'nandyal_rural', name: 'Nandyal Rural', nameTe: 'నంద్యాల రూరల్', lgdCode: 5014, lat: 15.46, lon: 78.52, villages: [
        { name: 'Ayyalur', nameTe: 'అయ్యలూరు', lat: 15.44, lon: 78.54 },
        { name: 'Chapirevula', nameTe: 'చాపిరేవుల', lat: 15.47, lon: 78.50 },
        { name: 'Kanala', nameTe: 'కనాల', lat: 15.43, lon: 78.49 }
      ]},
      { id: 'mahanandi', name: 'Mahanandi', nameTe: 'మహానంది', lgdCode: 5015, lat: 15.48, lon: 78.62, villages: [
        { name: 'Mahanandi (Pushkarini Kshetram)', nameTe: 'మహానంది పుష్కరిణి క్షేత్రం', lat: 15.48, lon: 78.62 },
        { name: 'Thimmapuram Mhn', nameTe: 'తిమ్మాపురం', lat: 15.46, lon: 78.60 }
      ]},
      { id: 'gospadu', name: 'Gospadu', nameTe: 'గోస్పాడు', lgdCode: 5016, lat: 15.38, lon: 78.50, villages: [
        { name: 'Gospadu HQ', nameTe: 'గోస్పాడు', lat: 15.38, lon: 78.50 }
      ]},
      { id: 'sirvel', name: 'Sirvel', nameTe: 'సిరివెళ్ల', lgdCode: 5017, lat: 15.32, lon: 78.53, villages: [
        { name: 'Sirvel HQ', nameTe: 'సిరివెళ్ల', lat: 15.32, lon: 78.53 }
      ]},
      { id: 'allagadda', name: 'Allagadda', nameTe: 'ఆళ్లగడ్డ', lgdCode: 5018, lat: 15.13, lon: 78.51, villages: [
        { name: 'Allagadda Town (Sculpture Hub)', nameTe: 'ఆళ్లగడ్డ టౌన్ (శిల్పకళా కేంద్రం)', lat: 15.13, lon: 78.51 },
        { name: 'Ahobilam (Nava Narasimha Kshetram)', nameTe: 'అహోబిలం క్షేత్రం', lat: 15.14, lon: 78.71 },
        { name: 'Yadawada', nameTe: 'యాదవాడ', lat: 15.11, lon: 78.53 }
      ]},
      { id: 'chagalamarri', name: 'Chagalamarri', nameTe: 'చాగలమర్రి', lgdCode: 5019, lat: 14.98, lon: 78.59, villages: [
        { name: 'Chagalamarri Border HQ', nameTe: 'చాగలమర్రి', lat: 14.98, lon: 78.59 }
      ]},
      { id: 'rudravaram', name: 'Rudravaram', nameTe: 'రుద్రవరం', lgdCode: 5020, lat: 15.24, lon: 78.63, villages: [
        { name: 'Rudravaram HQ', nameTe: 'రుద్రవరం', lat: 15.24, lon: 78.63 }
      ]},
      { id: 'dornipadu', name: 'Dornipadu', nameTe: 'దొర్నిపాడు', lgdCode: 5021, lat: 15.21, lon: 78.43, villages: [
        { name: 'Dornipadu HQ', nameTe: 'దొర్నిపాడు', lat: 15.21, lon: 78.43 }
      ]},
      { id: 'uyyalawada', name: 'Uyyalawada', nameTe: 'ఉయ్యాలవాడ', lgdCode: 5022, lat: 15.10, lon: 78.39, villages: [
        { name: 'Uyyalawada (Narasimha Reddy Birthplace)', nameTe: 'ఉయ్యాలవాడ', lat: 15.10, lon: 78.39 }
      ]},
      { id: 'banaganapalle', name: 'Banaganapalle', nameTe: 'బనగానపల్లె', lgdCode: 5023, lat: 15.32, lon: 78.23, villages: [
        { name: 'Banaganapalle (Royal Palace & Mango Hub)', nameTe: 'బనగానపల్లె (బేనిషా మామిడి కేంద్రం)', lat: 15.32, lon: 78.23 },
        { name: 'Yaganti (Uma Maheswara Swamy)', nameTe: 'యాగంటి క్షేత్రం (నంది పెరుగుదల)', lat: 15.35, lon: 78.14 },
        { name: 'Palukuru', nameTe: 'పలుకూరు', lat: 15.30, lon: 78.25 }
      ]},
      { id: 'owk', name: 'Owk', nameTe: 'ఔకు', lgdCode: 5024, lat: 15.21, lon: 78.12, villages: [
        { name: 'Owk Reservoir Town', nameTe: 'ఔకు రిజర్వాయర్', lat: 15.21, lon: 78.12 }
      ]},
      { id: 'koilkuntla', name: 'Koilkuntla', nameTe: 'కోవెలకుంట్ల', lgdCode: 5025, lat: 15.23, lon: 78.31, villages: [
        { name: 'Koilkuntla Town', nameTe: 'కోవెలకుంట్ల టౌన్', lat: 15.23, lon: 78.31 }
      ]},
      { id: 'sanjamala', name: 'Sanjamala', nameTe: 'సంజామల', lgdCode: 5026, lat: 15.16, lon: 78.20, villages: [
        { name: 'Sanjamala HQ', nameTe: 'సంజామల', lat: 15.16, lon: 78.20 }
      ]},
      { id: 'kolimigundla', name: 'Kolimigundla', nameTe: 'కొలిమిగుండ్ల', lgdCode: 5027, lat: 15.08, lon: 78.07, villages: [
        { name: 'Belum Caves (Second Largest in India)', nameTe: 'బెలూం గుహలు', lat: 15.10, lon: 78.11 },
        { name: 'Kolimigundla HQ', nameTe: 'కొలిమిగుండ్ల', lat: 15.08, lon: 78.07 }
      ]},
      { id: 'dhone', name: 'Dhone', nameTe: 'డోన్', lgdCode: 5028, lat: 15.42, lon: 77.87, villages: [
        { name: 'Dhone Town (Railway Junction)', nameTe: 'డోన్ టౌన్', lat: 15.42, lon: 77.87 },
        { name: 'Rangapuram', nameTe: 'రంగాపురం', lat: 15.40, lon: 77.89 },
        { name: 'Jaladurgam', nameTe: 'జలదుర్గం', lat: 15.44, lon: 77.85 }
      ]},
      { id: 'peapully', name: 'Peapully', nameTe: 'ప్యాపిలి', lgdCode: 5029, lat: 15.24, lon: 77.76, villages: [
        { name: 'Peapully HQ', nameTe: 'ప్యాపిలి', lat: 15.24, lon: 77.76 }
      ]},
      { id: 'bethamcherla', name: 'Bethamcherla', nameTe: 'బెతంచెర్ల', lgdCode: 5030, lat: 15.46, lon: 78.15, villages: [
        { name: 'Bethamcherla Stone Quarries Hub', nameTe: 'బెతంచెర్ల పాలరాయి కేంద్రం', lat: 15.46, lon: 78.15 }
      ]},
      { id: 'panyam', name: 'Panyam', nameTe: 'పాణ్యం', lgdCode: 5031, lat: 15.52, lon: 78.35, villages: [
        { name: 'Panyam Cement Hub', nameTe: 'పాణ్యం', lat: 15.52, lon: 78.35 },
        { name: 'Pinnapuram Solar Park', nameTe: 'పిన్నాపురం', lat: 15.55, lon: 78.33 }
      ]},
      { id: 'gadivemula', name: 'Gadivemula', nameTe: 'గడివేముల', lgdCode: 5032, lat: 15.60, lon: 78.43, villages: [
        { name: 'Gadivemula HQ', nameTe: 'గడివేముల', lat: 15.60, lon: 78.43 }
      ]},
      { id: 'nandikotkur', name: 'Nandikotkur', nameTe: 'నందికొట్కూరు', lgdCode: 5033, lat: 15.86, lon: 78.26, villages: [
        { name: 'Nandikotkur Town', nameTe: 'నందికొట్కూరు టౌన్', lat: 15.86, lon: 78.26 },
        { name: 'Malyala Pumping Scheme', nameTe: 'మాల్యాల', lat: 15.84, lon: 78.29 }
      ]},
      { id: 'pagidyala', name: 'Pagidyala', nameTe: 'పగిడ్యాల', lgdCode: 5034, lat: 15.93, lon: 78.34, villages: [
        { name: 'Pagidyala HQ', nameTe: 'పగిడ్యాల', lat: 15.93, lon: 78.34 }
      ]},
      { id: 'jupadu_bungalow', name: 'Jupadu Bungalow', nameTe: 'జూపాడు బంగ్లా', lgdCode: 5035, lat: 15.89, lon: 78.44, villages: [
        { name: 'Jupadu Bungalow HQ', nameTe: 'జూపాడు బంగ్లా', lat: 15.89, lon: 78.44 }
      ]},
      { id: 'kothapalle', name: 'Kothapalle', nameTe: 'కొత్తపల్లె', lgdCode: 5036, lat: 15.98, lon: 78.49, villages: [
        { name: 'Sangameswaram Confluence', nameTe: 'సంగమేశ్వరం సప్త నదీ సంగమం', lat: 16.02, lon: 78.47 },
        { name: 'Kothapalle HQ', nameTe: 'కొత్తపల్లె', lat: 15.98, lon: 78.49 }
      ]},
      { id: 'midthur', name: 'Midthur', nameTe: 'మిడ్తూరు', lgdCode: 5037, lat: 15.75, lon: 78.35, villages: [
        { name: 'Midthur HQ', nameTe: 'మిడ్తూరు', lat: 15.75, lon: 78.35 }
      ]},
      { id: 'pamulapadu', name: 'Pamulapadu', nameTe: 'పాములపాడు', lgdCode: 5038, lat: 15.78, lon: 78.47, villages: [
        { name: 'Pamulapadu HQ', nameTe: 'పాములపాడు', lat: 15.78, lon: 78.47 }
      ]},
      { id: 'srisailam', name: 'Srisailam', nameTe: 'శ్రీశైలం', lgdCode: 5039, lat: 16.07, lon: 78.87, villages: [
        { name: 'Srisailam (Mallikarjuna Jyotirlinga)', nameTe: 'శ్రీశైల భ్రమరాంబ మల్లికార్జున క్షేత్రం', lat: 16.07, lon: 78.87 },
        { name: 'Sunnipenta Project Colony', nameTe: 'సున్నిపెంట', lat: 16.05, lon: 78.84 }
      ]},
      { id: 'atmakur_ndl', name: 'Atmakur (Nandyal)', nameTe: 'ఆత్మకూరు', lgdCode: 5040, lat: 15.88, lon: 78.59, villages: [
        { name: 'Atmakur Town', nameTe: 'ఆత్మకూరు టౌన్', lat: 15.88, lon: 78.59 }
      ]},
      { id: 'velgode', name: 'Velgode', nameTe: 'వెలుగోడు', lgdCode: 5041, lat: 15.79, lon: 78.58, villages: [
        { name: 'Velgode Balaji Reservoir', nameTe: 'వెలుగోడు రిజర్వాయర్', lat: 15.79, lon: 78.58 }
      ]}
    ]
  }
];
