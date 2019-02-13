var express = require('express');
var app = require('express')();
var router = express.Router();

var bcrypt = require('bcryptjs');
var slug = require('slug');
var moment = require('moment');
var url = require('url');
var crypto = require("crypto");
const fs = require('fs');
var path = require('path');
const { URL } = require('url');
const OpeningTimes = require('moment-opening-times');
var request = require('request');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
var nodemailer = require('nodemailer');
var md5 = require('md5');
var validator = require('validator');
var elasticsearch = require('elasticsearch');
var Jimp = require("jimp");
var Typo = require("typo-js");
var dictionary = new Typo("en_US");
var Fuse = require("fuse.js");
var _ = require('lodash');
var multer  = require('multer');
var mime = require('mime');
var nationalities = require(__dirname + '/../models/Nationalities');

var sys = require(__dirname + '/../config/System');
var role = require(__dirname + '/../config/Role');
var User = require('./../models/User');
var Business = require('./../models/Business');
var Category = require(__dirname + '/../models/Category');
var emailModel = require(__dirname + '/../config/Mail');
var Analytics = require(__dirname + '/../models/Analytics');
var Coupons = require(__dirname + '/../models/Coupons');
var Review = require(__dirname + '/../models/Reviews');
var Advert = require(__dirname + '/../models/Advert');
var Product = require(__dirname + '/../models/Product');

var mailer = require('express-mailer');
             
const CATS = [
  "travel","financial services","transport","electronics","clothes","medical","motor","advertising","manufacturing","luxury goods","shopping","hospitality","office","leisure","shops","parastatals","fashion and beauty","transport & shipping","electrical equipment & supplies","events","healthcare","shoes","marketing","others","education","construction","home","restaurants","professional services","entertainment","agriculture"];
const SUBCATS = [
  "flights",
  "hotel booking",
  "hotel transfer",
  "tour guides",
  "car rental",
  "forex bureaus",
  "travel agency",
  "relocation services",
  "safaris",
  "shipping agencies",
  "tour guiding consultants",
  "tourist attraction & information",
  "tours & safaris",
  "transport agents",
  "travel agencies",
  "cottages ",
  "lawyers & advocates",
  "tax consultants",
  "stock & share brokers",
  "valuers",
  "credit information ",
  "debt collection agencies",
  "advisory",
  "transporters",
  "warning defaulters",
  "kitchen",
  "x-ray services",
  "x-ray apparatus",
  "hospitals",
  "chemist",
  "drug abuse control",
  "family planning services ",
  "first aid",
  "health care",
  "optician",
  "health care products",
  "health centres",
  "health management organisations",
  "health tourism",
  "hearing aids",
  "herbalists",
  "hiv-aids",
  "hospitals",
  "laboratories - clinical",
  "laboratories - x-ray",
  "laboratories quality control",
  "maternity homes",
  "medical assistance organisations",
  "medical centres ",
  "medical insurance",
  "medical practitioners allergists",
  "medical practitioners anaesthetists",
  "medical practitioners chest physicians",
  "medical practitioners dermatologists (skin specialists)",
  "medical practitioners cardiologists (heart specialists)",
  "medical practitioners ent specialists",
  "medical practitioners general practitioners",
  "medical practitioners gynaecologists",
  "medical practitioners neurologists (nerve specialists)",
  "medical practitioners oncologists (tumour specialists)",
  "medical practitioners ophthalmologists (eye specialists)",
  "medical practitioners orthopaedic surgeons",
  "medical practitioners paediatricians",
  "medical practitioners pathologists",
  "medical practitioners pharmacists",
  "medical practitioners physicians",
  "optical goods",
  "opticians",
  "medical practitioners physiotherapists",
  "medical practitioners plastic surgeons",
  "medical practitioners psychiatrists",
  "medical practitioners radiologists",
  "medical practitioners surgeons",
  "pharmaceutical equipment",
  "pharmacies",
  "physiotherapists",
  "rehabilitation centres",
  "reproductive health services",
  "phychiatrists",
  "pscychologists",
  "veterinary doctors ",
  "veterinary equipment & supplies",
  "veterinary surgeons",
  "clinics ",
  "dental equipment & supplies",
  "dental practitioners",
  "dental practitioners orthodontists",
  "car dealers",
  "garages",
  "garages equipment & supplies",
  "lubricants",
  "oils lubricating",
  "pannel beating",
  "motorvehicle repairing & services",
  "motorvehicle parts & supplies",
  "motorvehicle hire",
  "motorvehicle dealers used",
  "motorvehicles new",
  "motorvehicle body repairing & painting",
  "motorvehicle body building",
  "motorvehicle accesories",
  "motors rewinding",
  "motors",
  "motorcycles & motors scooters repairing",
  "petrol stations",
  "petrol stations equipment & maintenance",
  "petroleum products",
  "truck dealers",
  "truck parts and supplies",
  "flags & banners",
  "outdoor advertising",
  "promotional materials",
  "galvanizing",
  "gas-bottled & bulk",
  "foam & foam products",
  "foil printing",
  "glass manufacturers",
  "ice cream manufacturers",
  "industrial chemicals",
  "industrial equipment & supplies",
  "industrial products",
  "industrial safety equipment",
  "furniture manufacturers",
  "information systems & equipment",
  "hardware-wholesale & manufacturers",
  "kitchen fittings & fixtures",
  "labels",
  "housewares-wholesalers & manufacturers",
  "hydraulic equipment & supplies",
  "machine tools",
  "machinery",
  "machinery parts",
  "lifting machinery & equipment ",
  "packaging machinery",
  "packaging materials",
  "metal merchants",
  "packaging - metal",
  "metal window manufacturers",
  "metallizing",
  "mining & quarrying equipments",
  "paper manufactures",
  "pharmaceutical -manufactureres,agents & distributors",
  "radiator manufacturers",
  "roofing materials",
  "rubber products",
  "publishers",
  "tanks",
  "tanners",
  "tarpaulin manufacturers & supplies",
  "scientific apparatus & instruments",
  "textile fibres",
  "textile machinery & parts",
  "textile manufacturers",
  "textile merchants",
  "shoes manufacturers & wholesalers",
  "shoes retail",
  "soaps & detergents",
  "tobacco manufacturers & dealers",
  "sports equipment & supplies",
  "toys manufacturers & wholesalers",
  "towel manufacturers",
  "sportwear",
  "stainless steel",
  "steelwool",
  "tyre distributors & manufactures",
  "sugar manufacturers & dealers",
  "water tanks",
  "weighing  equipment & supplies",
  "manufaturers",
  "tool/manufacturers & wholesalers",
  "tissues & serviettes",
  "gems",
  "hair care",
  "hair equipments & supplies",
  "handicrafts",
  "jewellers",
  "mobile phones dealers & accesories",
  "perfumes",
  "picture frames",
  "taxicabs",
  "watches - dealers & repairs",
  "wines & spirits",
  "duty free shops",
  "footwear retail",
  "footwear wholesale & manufacturers",
  "hair accesories",
  "salt",
  "sausages",
  "scales",
  "second hand goods dealers",
  "supermarkets",
  "hotels",
  "holiday homes",
  "nursing homes & services",
  "relief supplies",
  "social services organizations",
  "beach hotels",
  "accountants",
  "auditors",
  "actuaries",
  "electronic equipment & supplies",
  "electronic products",
  "electronic tax register",
  "elevators & escalators",
  "e-mail services",
  "embassies",
  "duplicating machines & supplies",
  "duplicating service",
  "employment agencies",
  "enamelware",
  "energy management consultants",
  "environmental conservation agencies",
  "environmental, conservation & ecological organizations",
  "furniture-office",
  "inks-printing",
  "office automation",
  "office & desk space rental",
  "office equipment & supplies",
  "office furniture",
  "messenger services",
  "paging & signalling services",
  "parcel services",
  "photocopying equipment,accessories & supplies",
  "photocopying services",
  "printers",
  "printers packaging",
  "printers-screen",
  "printing ink ",
  "rubber stamps",
  "screen printers",
  "stationery",
  "typesetting ",
  "typewriters",
  "typewriting service",
  "fitness centres",
  "fitness equipment & supplies",
  "gymnasium",
  "ice cream parlours",
  "fruit juices",
  "juice - parlours, manufacturers & dealers",
  "physical fitness",
  "swimming pools",
  "gift shops",
  "housewares retail",
  "hardware retail",
  "mens clothing retail",
  "pastry shops",
  "pet shops",
  "retail shops",
  "shopping centres",
  "wholesale shops",
  "curios",
  "examination bodies",
  "investment securities",
  "investments",
  "non-governmental organizations",
  "oil companies",
  "welfare organisations",
  "clothing accessories ",
  "clothing manufacturers & wholesalers ",
  "clothing manufacturers & wholesalers ",
  "clothing retail",
  "cosmetics & perfumes ",
  "clearing & forwarding ",
  "containerized freight services ",
  "courier services ",
  "logistics",
  "trailers",
  "transformers",
  "electrical appliances",
  "electrical appliances manufacturers & wholesaler",
  "electrical appliances repairing",
  "electrical contractors",
  "electrical equipment",
  "electrical fittings",
  "electrical heating equipment & systems",
  "electrical supplies",
  "electric cables",
  "electric generators",
  "electric lighting systems",
  "electric pumps",
  "event organizers",
  "exhibitions & trade fairs",
  "sanitary disposal services",
  "sanitary napkins",
  "sanitaryware & fittings",
  "sewage disposal",
  "surgical supplies",
  "water treatment",
  "warning defaulters",
  "pending",
  "security system",
  "women shoes",
  "warning & defaulters",
  "test",
  "children's homes",
  "advertising & marketing agencies & services",
  "acids",
  "chemicals",
  "zippers",
  "adhesive tapes",
  "adhesives",
  "advertising displays",
  "advertising outdoor",
  "aerials & antennas",
  "workshop equipments",
  "wood workers",
  "wood carvings",
  "agricultural equipments & supplies",
  "air cargo service",
  "air charter ",
  "air compressor manufacturers & dealers",
  "air compressor manufacturers & dealers",
  "air conditioning contractors",
  "air conditioning equipment & systems",
  "air conditioning equipment & systems-repairing ",
  "aircraft ground support & services",
  "aircraft maintenance",
  "aircraft parts & supplies",
  "airline companies",
  "airport services",
  "alarms",
  "alternative medicine",
  "aluminium",
  "ambulance services ",
  "animal health",
  "animal husdandry",
  "aquariams",
  "architects",
  "architecturial  materials ",
  "art & craft products",
  "art galleries & dealers",
  "asset management solutions",
  "societies & associations ",
  "auctioneers",
  "audio-visual equipment & services",
  "auto accesories",
  "baby accessories",
  "badges",
  "cables",
  "bags,burlap,canvas & cotton",
  "cabling & trunking",
  "bakers & pastry shops",
  "call centres",
  "camping equipment",
  "bakery equipment & supplies",
  "camping sites",
  "balloons",
  "banks",
  "canned foods",
  "bar codes",
  "canvas & canvas products",
  "bathrooms",
  "capital markets",
  "batteries",
  "car hire",
  "carbon products",
  "cards greeting",
  "bearings & power transmission ",
  "carpet & rug dealers",
  "beauty salons",
  "cartons",
  "casinos",
  "beauty salon equipment & supplies",
  "caterers",
  "beddings",
  "cartering equipment",
  "bee keeping",
  "cement",
  "beer & ale",
  "ceramic products",
  "betting",
  "beverages",
  "certified public secretaries",
  "bicycles-dealers & repairs",
  "chains",
  "biogas power generation",
  "biscuits",
  "charity services ",
  "bitumen products",
  "chemical engineers",
  "chemicals",
  "blacksmiths",
  "blankets",
  "chemists - dispensing",
  "blinds",
  "boilers",
  "bonesetting",
  "bookbinders",
  "childrens & infants wear",
  "chocolate manufacturers",
  "bookkeeping services",
  "churches & church organizations",
  "bookshops",
  "boreholes drilling",
  "boutiques",
  "cigar, cigarette & tobacco dealers",
  "cinemas",
  "civil engineers",
  "brake pads & lining ",
  "clay products",
  "breakdown service",
  "cleaning equipment",
  "brewers",
  "cleaning services",
  "bridal shops",
  "broadcasting companies",
  "clearing & forwarding",
  "broadcasting equipment ",
  "brushes",
  "clocks - dealers and repairs",
  "building contractors",
  "building materials",
  "building & planning consultants",
  "clothing-protective",
  "building repairers  & renovators",
  "bureau services",
  "burglar proofing",
  "bus companies",
  "business centres",
  "business consultants",
  "business machines",
  "business process outsourcing",
  "business schools",
  "butcheries",
  "colour separation",
  "buttons",
  "communication equipment",
  "communications",
  "company registration services",
  "company services",
  "dancing instruction",
  "data backup",
  "computers - cabling & networking",
  "data processing services & supplies",
  "data recovery",
  "delivery services",
  "designers  indusrial",
  "designers interior",
  "consumer products",
  "designers-clothing",
  "co-operatives",
  "cotton",
  "diaries",
  "cranes",
  "crankshaft grinders",
  "diesel engines parts & services",
  "diesel power generation",
  "cultural organizations",
  "digital imagining",
  "diplomatic missions",
  "e-commerce",
  "electric fencing",
  "directory publishers",
  "discotheques",
  "disinfectants",
  "electric light & power companies",
  "disposable products",
  "distillers",
  "electric  lighting systems",
  "electric pumps",
  "distributors & stockists",
  "electric tools",
  "doctors",
  "document storage & management",
  "domestic help agencies",
  "electrical  contractors",
  "doors",
  "drainage contractors",
  "drapiers & curtains",
  "dressmakers",
  "electro plating",
  "electronic components",
  "drilling contractors",
  "electronic equipment reparing",
  "drilling contractors-micro tunneling",
  "drinking straw",
  "driving instruction",
  "driving schools",
  "dyes & dye stuff",
  "fabricators",
  "fabrics",
  "fibre glass",
  "enzymes",
  "filters",
  "fireworks",
  "fish merchants",
  "fishing tackle",
  "garbage disposal",
  "gas cylinders",
  "flour",
  "generators",
  "food products",
  "foundries",
  "haberdashery supplies",
  "hides & skins",
  "high commissions",
  "hire purchase",
  "homes-aged & rest",
  "homoeopaths",
  "honey",
  "knit goods",
  "hydro power generation",
  "leather goods",
  "marine equipment & labeling assets",
  "matches",
  "meat",
  "local authorities",
  "nuts-edible",
  "meteorogical equipments",
  "meters",
  "microfilming service,equipment & supplies",
  "mineral water",
  "minerals",
  "mining companies",
  "monstaries",
  "mosques",
  "motorcycle hire",
  "motorcycles & motor scooters repairing",
  "paper & board merchants",
  "paper converters",
  "paper products",
  "parking stations & garages",
  "parks",
  "peanut merchants",
  "pencils",
  "philately",
  "photographic equipments",
  "photographic prints",
  "photographic products & supplies",
  "plastic containers ",
  "plastic packaging  ",
  "plastic products",
  "plastic raw materials",
  "pleating & hemstitching",
  "plywood & veneers",
  "polythene",
  "power control equipment",
  "power generation",
  "pre-shipment inspection",
  "ropes",
  "safes & vaults",
  "safety equipment & services",
  "telecommunication equipment",
  "temples",
  "tents",
  "shipping agents",
  "threads & yarns",
  "timber treatment",
  "tins & tinsmiths",
  "societies & associations",
  "tissue & serviette",
  "socks",
  "toiletry",
  "tools-electrical",
  "spices",
  "trade unions",
  "spray painting & finishing",
  "trading companies",
  "tyres retread",
  "uniforms",
  "uninterruptible power supply",
  "sweets",
  "waste paper",
  "water",
  "water",
  "water purification & filtration",
  "wildlife conservation",
  "consumer products ",
  "cotton ",
  "cyber cafes ",
  "detergents",
  "trade development organisations",
  "flying schools",
  "hairdressing schools",
  "international schools",
  "kindergartens",
  "language schools",
  "nursery schools & homes",
  "religious schools",
  "private schools-primary",
  "private schools-secondary",
  "schools - colleges & universities",
  "schools - commercial & secretarial",
  "schools - international",
  "schools - languages",
  "schools - nursery & kindergarten",
  "schools - polytechnic",
  "schools - primary",
  "schools - secondary",
  "schools - supplies",
  "schools - uniform",
  "secretarial",
  "theological colleges",
  "training institutes",
  "universities",
  "colleges ",
  "collleges - aviation ",
  "computers - training ",
  "tuition",
  "colleges - aviation",
  "floor laying & re-surfacing",
  "floor tiles",
  "forklifts",
  "foundations",
  "hose & tubing",
  "hotel locks & safes",
  "land surveyors",
  "machinery rebuilding & repairing",
  "landscaping",
  "marble",
  "lift contractors & repairers",
  "lighting fixtures & apparatus",
  "lightning systems & equipment",
  "nuts & bolts",
  "paint - retail",
  "paint - wholesale & manufacturers",
  "quantity surveyors",
  "pipes & fitting ",
  "plumbing contractors",
  "plumbing supplies",
  "renovators",
  "roofing contractors",
  "pumps",
  "pvc products",
  "sawmills",
  "terrazzo chips",
  "ship builders & repairers",
  "shipping lines",
  "tiles",
  "timber dealers ",
  "tractors-dealers,service & spares",
  "steel mills",
  "valves",
  "surveyors",
  "switches",
  "ventilating equipment supplies",
  "warehouses",
  "workshop equipment & supplies",
  "wood workers",
  "wire products",
  "wheelbarrows",
  "waterproofing contractors",
  "welding equipment & supplies",
  "concrete products ",
  "construction equipment ",
  "construction management ",
  "contractors - building ,general ",
  "contractors - engineering ,general ",
  "apartments",
  "appliance household",
  "furnishings",
  "furniture household",
  "kitchen utensils",
  "hostels",
  "hotels",
  "household appliances",
  "laundries",
  "laundry & drycleaning equipment",
  "mattresses",
  "oils - cooking",
  "refrigeration equipment",
  "refigerators & freezers",
  "prefabricated building & houses",
  "property management",
  "sewing machines-household",
  "accomodation",
  "curtain & drapery fabrics ",
  "cushions ",
  "chinese",
  "international",
  "african",
  "continental",
  "brazillian",
  "steakhouse",
  "ethiopian",
  "kitchen equipment & supplies",
  "resorts",
  "asian",
  "fast food",
  "japanese",
  "sushi",
  "pizza",
  "cafe",
  " barbeque",
  "catering equipment",
  "bakery",
  " mediterranean",
  "bars",
  "seafood",
  "thai",
  " patisserie",
  "kenyan",
  "vegetarian",
  "salad bars",
  "afghan",
  "greek",
  "italian",
  "indian",
  "spanish",
  "lounge",
  "irish",
  "turkish",
  "persian",
  "portuguese",
  "multi cuisine",
  "lebanese",
  "eritrean",
  "pan asian",
  "bistro",
  "burger",
  "mexican",
  "formal dining",
  "british",
  "swahili",
  "tapas",
  "french",
  "west african",
  "lawyers",
  "agricultural consultants ",
  "accountants",
  "auditors",
  "dry cleaners",
  "business consultants",
  "financial consultants",
  "embroidery ",
  "emergency services",
  "engineering surveys",
  "engineers",
  "facilities management",
  "engineers - consulting",
  "engravers",
  "fashion designers",
  "envelopes - manufacturers & wholesalers",
  "environmental consultants",
  "estate agents",
  "finance companies",
  "estate management",
  "finance consultants",
  "financial services",
  "fire fighting equipment & system- suppliers & contractors",
  "fire protection consultants",
  "fire surveyors",
  "exhaust pipes & silencers",
  "export processing zones",
  "exporters",
  "garden & lawn equipment supplies",
  "florists",
  "general merchants",
  "glass coating & tinting",
  "glass importers",
  "glassware merchants",
  "graphic designers",
  "guards & patrol service",
  "gymnasium equipment & supplies",
  "importers",
  "importers & exporters",
  "freign exchange bureau",
  "industrial consultants",
  "industrial consultants",
  "freight forwarding ",
  "industrial designers",
  "funeral services",
  "furniture dealers ",
  "industrial organizations",
  "furniture designers",
  "information & communication technology services",
  "information & communication technology services",
  "information systems consultants",
  "hairdressers & barber shops",
  "inspection services",
  "insurance brokers & agents",
  "insurance companies",
  "insurance consultants",
  "interior decorators",
  "interior designers",
  "international organizations",
  "internet services",
  "investigators",
  "investment management",
  "holding companies",
  "knit goods-manufacturers & wholesalers",
  "human resource consultants",
  "laboratory supplies",
  "labour organizations",
  "management consultant",
  "lift makers & dealers",
  "mechnical engineers",
  "logistics providers",
  "loss adjusters & assesors",
  "news agencies & services ",
  "news agencies & services ",
  "office equipment-repair",
  "oil company contractors",
  "painting contractors",
  "micro finance institutions",
  "packaging bag makers",
  "movers",
  "mobile phones repairs & service",
  "modelling agencies",
  "money transfer",
  "motorvehicle assesors & valuers",
  "mortgages",
  "motorcycle dealers",
  "pension scheme companies",
  "petrol & oil marketers & distribution",
  "petroleum companies",
  "photographers",
  "real estate agents,developers & valuers",
  "recruitment consultants",
  "planning  consultants",
  "registrar services",
  "regulatory bodies",
  "research organizations",
  "private investigators",
  "retirement benefits advisers",
  "procurement agents",
  "project consultants",
  "property developers",
  "property investment companies",
  "sanitary disposal services",
  "public relations consultants",
  "purchasing service",
  "satellite equipment & services",
  "tailors-general",
  "tailors-ladies",
  "tailors-mens",
  "scrap metal dealers",
  "screen printing equipment & supplies",
  "secretarial services",
  "telecommunication operators ",
  "telecommunication service",
  "security control equipment & systems",
  "security guard & patrol services",
  "service stations-petrol & oil",
  "ship brokers",
  "ship chandlers",
  "shoe & leather polishes",
  "software developers",
  "solar energy - equipment & supplies",
  "training consultants",
  "trust companies",
  "steam equipment & supplies",
  "steel suppliers",
  "tyre dealers & equipment supplies",
  "ventilating contractors",
  "waste disposal",
  "water engineers",
  "website designers",
  "videographics",
  "commercial agencies ",
  "commission agents ",
  "commodity brokers ",
  "company secretaries ",
  "computer consultants ",
  "computer stationery suppliers ",
  "computers-hardware & maintenance ",
  "computers-software & services ",
  "conference facilities & organisers ",
  "consultants ",
  "consultants - education & career",
  "controls,control systems & regulators ",
  "convents & monasteries ",
  "conveyors & conveying equipment ",
  "counselling services ",
  "data network services",
  "decorators-interiors",
  "designers interior",
  "detectives",
  "desktop publishing",
  "translators and interpreters",
  "toilet-portable",
  "electrical engineers",
  "electrical wiring",
  "casinos",
  "cinemas",
  "minigolf",
  "nightlife",
  "entertainers",
  "film companies",
  "film & video production",
  "films-photos",
  "fishing",
  "golf clubs",
  "magazine dealers",
  "magazine publishers",
  "media agencies",
  "lottery",
  "newspapers & periodicals",
  "musical instruments - dealers & repairs",
  "music & video shops",
  "music studios",
  "music instruction",
  "mobile applications dealers",
  "music instruction",
  "museums",
  "mould & tool makers",
  "radio comunication equipment & systems",
  "radio stations",
  "radio & television stations",
  "recording service-sound",
  "pool & snooker tables",
  "television & radio stations",
  "theatres & cinemas",
  "sports",
  "sports organizations",
  "video libraries",
  "video tape recorders",
  "videography",
  "clubs",
  "games & game supplies",
  "animal feeds",
  "farm machineries",
  "farms",
  "feeds dealers",
  "fertilizers",
  "fishing",
  "floriculture",
  "grain dealers",
  "grocers",
  "fruits",
  "insecticides",
  "hatcheries-poultry",
  "irrigation schemes",
  "irrigation systems & equipment",
  "horticulture",
  "lawn mowers",
  "livestock dealers",
  "millers-posho & grain",
  "milling equipment",
  "pest control",
  "ranches & dairy farms",
  "poultry",
  "tea brokers",
  "tea dealers & exporters",
  "tea machinery & equipment supplies",
  "tea processing",
  "termite control",
  "sisal products",
  "vegetables",
  "coffee dealers ",
  "coffee machinery & equipment supplies ",
  "coffee processing & export ",
  "confectionery & candy ",
  "dairy farms",
  "dairy products",
  "dairy equipments",
  "dairy support",
  "agricultural chemicals"
  ]
const CITIES =["nairobi","mombasa","kisumu","malindi","diani","nakuru","naivasha","eldoret"]
const AREAS =["langata","kileleshwa","kilimani","westlands","parklands","embakasi","cbd","karen"]

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    //var fileName = file.originalname + '-' + Date.now() + '.' + mime.extension(file.mimetype);
    var fileName = Date.now() + slug(file.originalname) +'.'+ mime.extension(file.mimetype);
    //var catalogName = file.originalname + '-' + Date.now() + '.' + mime.extension(file.mimetype);
    cb(null, fileName);
  }
});

var upload = multer({ storage: storage });
var cpUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'catalog', maxCount: 5 }, { name: 'gallery', maxCount: 30 }])


router.get('/allbusinesses', function(req, res, next){
  var bizArray = [];
  Business.find({},{name: 1, _id:-1})
  .then(function(d){
    d.forEach(function(x){
      //console.log(x.name);
      var result = x.name.split(/[,. \/-]/);
      result.forEach(function(g){
        bizArray.push(g);
      });
    });
    res.json(bizArray);
  });
});

// handle new search
router.get('/newsearch',function(req,res){
  let query = req.query.search.trim();
  let lon = Number(req.query.lon);
  let lat = Number(req.query.lat);
  let multi = query.split(' ');
  if(multi.length == 1){
    multi[1] = multi[0]
  }  
  let point = {
    "type": "Point",
    "coordinates": [lon,lat]
  };
  
  var q1 = Business.aggregate([{
    '$geoNear': {
      'near': point,
      'spherical': true,
      "query":{
        $and:[
          {$or:[ 
            {name:{
              $regex:query,
              $options:'i'
            }},
            {name:{
              $regex:multi[0],
              $options:'i'
              }}
            ]
          }
        ]
      },
      'distanceField': 'distance',
      'maxDistance': 1000000000000
    }
  }
]);

  var q2 = Business.aggregate([{
    '$geoNear': {
      'near': point,
      'spherical': true,
      "query":{
        $and:[{
        $or:[
          {subcategory:{
          $regex:query,
          $options:'im'
          }},
          {description:{
            $regex:query,
            $options:'im'
          }},
        ]
      }]
    },
      'distanceField': 'distance',
      'maxDistance': 1000000000000
    }
  }
]);

  Promise.all([q1,q2]).then(values => {
    
    var res1 = values[0].filter(function(biz){
      return biz.name.trim().toLowerCase().startsWith(multi[0]) ||
      biz.name.trim().toLowerCase().includes(multi[1])  
    })

    if(res1.length != 0){
      res.status(200).send(res1)
    }else{
      res.status(200).send(values[1])
    }
  })
})

//render new search
router.get('/newindex',function(req,res){

  var topsearches = Analytics.aggregate([
    {"$group":{
        _id: '$bizid',
        count:{$sum:1}
      }
    },
    { "$sort": { "count": -1 } },
    { "$limit": 5 },
    {
     $lookup:
       {
         from: "businesses",
         localField: "_id",
         foreignField: "_id",
         as: "biz"
       }
     }
  ]);
  var toprestaurants = Analytics.aggregate([
    {"$group":{
        _id: '$bizid',
        count:{$sum:1}
      }
    },
    { "$sort": { "count": -1 } },
    { "$limit": 500},
    {
     $lookup:
       {
         from: "businesses",
         localField: "_id",
         foreignField: "_id",
         as: "biz"
       }
     },
     {
       $project :{
         count: '$count',
         category: {
           $filter: {
             input: "$biz",
             as: "biz",
             cond : [
                 { '$eq': ['$biz.subcategory', 'Restaurants']},
                     1,
                     0
             ]
           }
         }
       }
     }
  ]);

  var coupons = Coupons.find({
    status: true
  }).populate('bizid').sort([['order', 1],['star', -1]]).limit(5);
  var reviews = Review.find().sort([['created_at', -1]]).populate('bizid').populate('user_id').limit(5);
  var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);
  var description = "Find It is a leading online directory to find businesses, service providers and their information in one single platform. Find it or be found. Register today and add your business.";
  var keywords = "Find Restaurants, professional services, Financial help, travel agencies, medical and legal help in Kenya on our platform Findit";
  var title = 'Find It Kenya | Find businesses and service providers in Kenya';
  Promise.all([categories, toprestaurants, topsearches, coupons, reviews ]).then(values => {
    //console.log(values[4]);Promise
    res.render('new-search', {
        title: title,
        categories: values[0],
        toprestaurants: values[1],
        topsearches: values[2],
        coupons: values[3],
        reviews: values[4],
        description: description,
        keywords: keywords,
        top: req.get('host')
    });
  });
})

router.get('/updatesearch',function(req,res){
  let query = req.query.search.trim().toLowerCase();

  let lon =req.query.lon ? Number(req.query.lon):36.8219;
  let lat =req.query.lat ? Number(req.query.lat):-1.2921;
  
  let multi = query.split(' ');
  let catSearch = [false,''];
  let subCatSearch = [false,''];
  multi = multi.filter(function(word){
    return word != 'in'
  })
  if(multi.length<1){
    multi.push(multi[0])
  }
  for(let i = 0; i < multi.length; i++){
    if(CATS.includes(multi[i])){
      catSearch[0] = true;
      catSearch[1] = multi[i]
    }
    if(SUBCATS.includes(multi[i])){
      subCatSearch[0] = true;
      subCatSearch[1] = multi[i]
    }
  }
  
  if(subCatSearch[0]){
    const subcat = subCatSearch[1].replace(/^\w/, c => c.toUpperCase());
    res.redirect('subcategory/undefined/'+subcat+'?lat='+lat+'&lon='+lon)
  }
    // }else if(catSearch[0]){
  //   const cat = catSearch[1].replace(/^\w/, c => c.toUpperCase());
  //   res.redirect('category/'+cat+'?lat='+lat+'&lon='+lon)
  // } 
  
  let point = {
    "type": "Point",
    "coordinates": [lon,lat]
  };

  var q1 = Business.aggregate([{
    '$geoNear': {
      'near': point,
      'spherical': true,
      "query":{
        $and:[
          {$or:[ 
              {branch:false},
              {branch:null}
            ]
          },
          {$or:[ 
            {name:{
              $regex:query,
              $options:'i'
            }},
            {name:{
              $regex:multi[0].substr(0,multi[0].length/1.5),
              $options:'i'
              }}
            ]
          }
        ]
      },
      'distanceField': 'distance',
      'maxDistance': 1000000000000
    }
  }
]);
  
  var q2 = Business.find({$or: [
    {
      name: { "$regex": query, "$options": "i" }
    },
    {
      keywords: { "$regex": query, "$options": "i" }
    },
    {
      subcategory: { "$regex": query, "$options": "i" }
    }
    ]
  }).sort({paid:-1})

  var categories = Category.find({group: 'general'}); 
  
  //SIMILAR BUSINESSES ON SEARCH PAGE
  var simbusinesses = Business.find({ features: req.params.name, branch: null, approved: true })
    .sort([['paid', -1], ['datepaid', 1], ['slug', 1]]);
  
  //var features = Category.findOne({ subcategories: {$elemMatch: { name: req.params.name}} });
  

  Promise.all([q2, q1, simbusinesses, categories]).then(values => {
    
    var res2 = values[0].filter(function(biz){
      return biz.branch == typeof 'undefined' || biz.branch == false || biz.branch == null
    })

    var res1 = values[1].filter(function(biz){
      return biz.name.trim().toLowerCase().startsWith(multi[0].substr(0,2)) ||
      biz.name.trim().toLowerCase().includes(multi[1]) || biz.name.trim().toLowerCase().includes(multi[0]) 
    })

    if(res2.length==0){
      res2 = res2.concat(res1)
    }
    
    //array  of current businesses features
    //let currentBusiness = res2;

    //array  of current businesses features
    let currentBusinessFeatures = res2.features;
    //currentBusinessFeatures.sort();

    let similarbusinesses = simbusinesses;

    for (let i = 0; i < similarbusinesses.length; i++) {

      for (let k = 0; k < similarbusinesses[i].features.length; k++) {
        similarbusinesses[i].features = similarbusinesses[i].features.filter(function (id) {
          return currentBusinessFeatures.indexOf(id) > -1;
        });
      }

    }
    
    
    res.render('business/search',{
      title: req.query.search,
      businesses: res2,
      simbusinesses: similarbusinesses,
      categories: values[2],
      host: req.get('host')
    });
  })
})

router.get('/search', function(req, res, next){
  var neatString = req.query.search.trim();
  var result = neatString.split(/[,. \/-]/);
  const item = result[0];
  const item2 = result[1]
  var bizArray = [];
  var skip = 0;
  if(req.query.skip){
    skip = parseInt(req.query.skip);
  }

  Business.find({branch: { $ne: 1 }},{name: 1, _id:-1})
  .then(function(d){
    d.forEach(function(x){
      //console.log(x.name);
      var result = x.name.split(/[,. \/-]/);
      result.forEach(function(g){
        bizArray.push(g);
      });
    });
    //res.json(bizArray);
    //console.log(result);
    function isInArray(value, array) {
      return array.indexOf(value) > -1;
    }
    function capitalize(string) {
        return string[0].toUpperCase() + string.slice(1);
    }
    var words_in_negation = ['and', 'in', 'the','kenya','nairobi','of','ltd','Ltd','shop','shops'];
    var special_words = bizArray;
    ///console.log(bizArray);

    var newstring = [];
    result.forEach(function(x){
      var capitalX = capitalize(x);
      if(isInArray(x, words_in_negation)){
        //newstring.push(x);
      }else if(isInArray(capitalX, special_words)){
        newstring.push(x);
      }
      else if(isInArray(x, special_words)){
        newstring.push(x);
      }
      else{
        //SPELL CHECK
        var checka = dictionary.check(x);
        var checkb = dictionary.check(capitalize(x));
        if(checka || checkb){
          if(checka){
            newstring.push(x);
          }else{
            newstring.push(capitalize(x));
          }
        }else{
          var a = dictionary.suggest(x);
        }
        //console.log(a);
        if (a === undefined || a.length == 0) {
          //newstring.push(x);
        }else{
          newstring.push(a[0]);
        }
      }
    });
    var searchString = newstring.join(' ');
    var businesses = Business.aggregate([
      {
          "$match": {
                 "$text": {
                       "$search": searchString
                  },
                  "branch": { '$ne' : true }
           }
      },
      {
           "$project": {
                 "_id": "$_id",
                 "name": '$name',
                 "slug": '$slug',
                 "subcategory": "$subcategory",
                 "features" : "$features",
                 "photo" : "$photo",
                 "reviews": "$reviews",
                 "paid": "$paid",
                 "description": "$description",
                 "facebook": "$facebook",
                 "twitter": "$twitter",
                 "youtube": "$youtube",
                 "linkedin": "$linkedin",
                 "phone": "$phone",
                 "website": "$website",
                 "keywords": "$keywords",
                 "branches": { $ne: [ "$branch", false ] },
                 "score": {
                       "$meta": "textScore"
                  }
            }
       },
       {
            "$match": {
                  "score": { "$gt": 10 }
             }
       },
       {
         "$sort": {
           "score": {
             $meta: "textScore"
           }
         }
       },
       { $limit: 20 },
       { $skip: skip }
     ]);


    /*var businesses = Business.find({
        $query: { approved: true},
      },
      {
        name:1,subcategory:1,keywords:1,description:1,features:1,reviews:1,slug:1,paid:1,
        website:1,photo: 1,instagram: 1,youtube:1,twitter:1,facebook:1, _id:0
      }
    ).sort([['paid', -1],['datepaid', 1]]);*/
    var array_of_suggestions = dictionary.suggest(req.query.search);
    var categories = Category.find({group: 'general'});
    Promise.all([businesses,categories]).then(values => {
      var list = values[0];
      //console.log(list);
      /*var options = {
        shouldSort: true,
        includeScore: true,
        matchAllTokens: true,
        threshold: 0.5,
        tokenize: true,
        maxPatternLength: 64,
        minMatchCharLength: 10,
        keys: [
          "name",
          "subcategory",
          "features"
      ]
      };
      var fuse = new Fuse(list, options); // "list" is the item array
      var result = fuse.search(req.query.search);*/
      //console.log(values[0]);
      res.render('business/search', {
          title: req.query.search,
          businesses: values[0],
          categories: values[1],
          suggestion: array_of_suggestions[0],
          host: req.get('host')
      });
    });
  });

});

router.get('/test', function(req, res){

});
/* GET home page. */
router.get('/nss/:name',function(req, res, next){
	//wait for the initialization
  //console.log(req.params.name);
  Business.find({$or: [
    {
      name: { "$regex": req.params.name, "$options": "i" }
    },
    {
      keywords: { "$regex": req.params.name, "$options": "i" }
    },
    {
      subcategory: { "$regex": req.params.name, "$options": "i" }
    }
    ],
    approved: true,
    pending: { $ne: true }
  })
  .select('-_id slug description name website')
  .then(function(data){
    res.json(data);
  });
});

router.get('/email', function (req, res, next) {
  var holder = emailModel.app;
  var mailer = emailModel.mailer;
  holder.mailer.send('email/forgotpassword', {
    to: 'kelvinchege@gmail.com', // REQUIRED. This can be a comma delimited string just like a normal email to field.
    subject: 'Welcome To FindIt', // REQUIRED.
    forgotpasswordlink:  req.get('host') + '/resetpassword/xxxxxx',// All additional properties are also passed to the template as local variables.
  }, function (err) {
    if (err) {
      // handle error
      console.log(err);
      res.send('There was an error sending the email');
      return;
    }
  });
});

router.get('/searchold',function(req, res, next){
  var result = req.query.search.split(/[, \/-]/);
  //console.log(result);
  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }
  var words_in_negation = ['and', 'in', 'the','kenya','nairobi','of']
  var newstring = [];
  result.forEach(function(x){
    if(isInArray(x, words_in_negation)){
      newstring.push(x);
    }else{
      var a = dictionary.suggest(x);
      
      if (a === undefined || a.length == 0) {
        newstring.push(x);
      }else{
        newstring.push(a[0]);
      }
    }
  });
  var searchString = newstring.join(' ');
  res.send(searchString);
  throw new Error("Something went badly wrong!");


  //wait for the initialization
  /*var search = Business.search(
    {query_string: {query: req.query.search}},
    {
      from : 0,
      size : 200,
      hydrate: true
    });*/
  var search = Business.find(
      {$text: {$search: req.query.search}},
      {score: {$meta: "textScore"}},
      { score: { $gt: 18 }  }
    )
    .sort({ score:{$meta:'textScore'}, paid: -1})
    .limit(20)
     //.sort([['paid', -1]]);
  var features = Category.find({name: req.query.search });
  var categories = Category.find({approved: true}).sort([['order', 1]]);
  var array_of_suggestions = dictionary.suggest(req.query.search);
  Promise.all([search, features, categories]).then(values => {
      console.log(values[0]);

      res.render('business/search', {

          title: req.query.search,
          //businesses: values[0].hits.hits,
          businesses: values[0],
          features: values[1],
          categories: values[2],
          suggestion: array_of_suggestions[0],
          host: req.get('host')
      });
  });
});

router.get('/moment',function(req,res){
    console.log(moment('20-01-2012 19:43:00', 'DD-MM-YYYY HH:mm'));
});

// VIEW ALL CATEGORIES
router.get('/mobile_categories', function (req, res, next) {
  var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);
  Promise.all([categories]).then(values => {
    res.render('business/viewcategories', {title: "Find It: Categories",categories: values[0]});
  });
});

//ADVERTISING

router.get('/advertising',function(req,res){
    var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);
    Promise.all([categories]).then(values => {
      res.render('site/advertising', {title: "Find It: Advertising",categories: values[0]});
    });
});

router.get('/advertising/2',function(req,res){
  var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);
  Promise.all([categories]).then(values => {
    res.render('site/advertisingtwo', {title: "Find It: Advertising", type: req.query.type,categories: values[0]});
  });
});

router.post('/advertising/2', cpUpload, function(req, res){
  var a = new Advert();
  a.price = req.body.price;
  a.paid = false;
  //console.log(req.files);
  if (req.files['photo'] != null){
    //console.log(req.files['photo'][0]);
    a.photo = req.files['photo'][0].filename;
  }
  a.save(function(err){
    if(err){
      console.log(err);
      req.flash("error_msg", "Something Wrong Happened");
      res.redirect('/');
    }else{
      if (req.files['photo'] != null){
        Jimp.read("./public/uploads/"+a.photo).then(function (cover) {
            return cover.resize(200, 150)     // resize
                 .quality(100)              // set greyscale
                 .write("./public/uploads/thumbs/adverts/"+a.photo); // save
         req.flash("success_msg", "Advertisement Successfully Created");
        }).catch(function (err) {
            console.error(err);
        });
      }else{
        req.flash("success_msg", "Advertisement Successfully Created");
      }
      ssn = req.session;
      ssn.hashkey = "852sokompare963001";
      ssn.vendor_id = "sokompare";
      ssn.advert_id = a._id;
      ssn.email = req.body.email;
      ssn.phone = req.body.phone;
      ssn.package = req.body.package;
      //var amount = req.body.price;
      var amount = "1";
      var fields = {
        "live":"1",
        "oid": a._id,
        "inv": "invoiceid"+a._id,
        "ttl": amount,
        "tel": req.body.phone,
        "eml": req.body.email,
        "vid": ssn.vendor_id,
        "curr": "KES",
        "p1": a._id,
        "p2": "",
        "p3": "",
        "p4": "",
        "lbk": 'https://'+req.get('host')+'/cancel',
        "cbk": 'https://'+req.get('host')+'/advert/receive',
        "cst": "1",
        "crl": "0"
      };
      var datastring =  fields['live']+fields['oid']+fields['inv']+
        fields['ttl']+fields['tel']+fields['eml']+fields['vid']+fields['curr']+fields['p1']+fields['p2']
        +fields['p3']+fields['p4']+fields['cbk']+fields['cst']+fields['crl'];
      var hash = crypto.createHmac('sha1',ssn.hashkey).update(datastring).digest('hex');
      res.render('site/advertpay', {title: "Pay",hash: hash, inputs: fields, datastring: datastring});
    }
  })
});

router.get('/advert/receive', function(req, res){
  var val = "sokompare";
  var val1 = req.query.id;
  var val2 = req.query.ivm;
  var val3 = req.query.qwh;
  var val4 = req.query.afd;
  var val5 = req.query.poi;
  var val6 = req.query.uyt;
  var val7 = req.query.ifd;
  var bizId = req.query.p1;
  var array = req.query.p2;
  var status = req.query.status;
  var amount = req.query.mc;

  var ipnurl = "https://www.ipayafrica.com/ipn/?vendor="+val+"&id="+val1+"&ivm="+val2+"&qwh="+val3+"&afd="+val4+"&poi="+val5+"&uyt="+val6+"&ifd="+val7;
  //console.log(ipnurl);
  Advert.findById(req.session.advert_id)
  .then(function(b){
    b.paid = true;
    b.email = req.session.email;
    b.phone = req.session.phone;
    b.price = amount;
    b.date = new Date();
    b.type = req.session.package;
    //if(amount == "2320"){

    request(ipnurl, function (error, response, body) {
      //console.log(body); // Print the HTML for the Google homepage.
      //res.send("Status > " + status + ", Body > " +body);
      //res.end();
      if(body == status){
        b.save(function(err){
          req.flash('success_msg', 'Payment Successfully Done!');
          if(err){
            console.log(err);
            res.redirect('/');
          }
          res.redirect('/');
        });

      }else{
        req.flash('error', 'Transaction Already Authenticated!');
        res.redirect('/');
      }
    });
  })
  .catch(function(err){
    console.log(err);
  });
});


// END ADVERTISING

router.get('/facebook',function(req,res){
    res.render('socials/facebook', {title: "Find It: Complete Facebook Sign Up"});
});

router.post('/facebook', function(req, res){
  User.findById(req.user._id)
  .then(function(d){
    d.email = req.body.email;
    d.phone = req.body.phone;
    d.save(function(err){
      if(err){
        req.flash('error','Some Error Occured, Kindly try again');
        res.redirect(ssn.returnUrl);
      }else{
        req.flash('success_msg','SignUp completed Successfully');
        res.redirect('/');
      }
    });
  });
});

router.get('/google',function(req,res){
    res.render('socials/google', {title: "Find It: Complete Google Sign Up"});
});

router.post('/google', function(req, res){
  User.findById(req.user._id)
  .then(function(d){
    d.phone = req.body.phone;
    d.save(function(err){
      if(err){
        req.flash('error','Some Error Occured, Kindly try again');
        res.redirect(ssn.returnUrl);
      }else{
        req.flash('success_msg','SignUp completed Successfully');
        res.redirect('/');
      }
    });
  });
});

router.get('/fetchCat/:name',function(req, res, next){
  //wait for the initialization
  Category.findOne({name: req.params.name})
  .then(function(data){
    res.json(data);
  });
});

router.get('/', function(req, res, next) {
  var topsearches = Analytics.aggregate([
    {"$group":{
        _id: '$bizid',
        count:{$sum:1}
      }
    },
    { "$sort": { "count": -1 } },
    { "$limit": 5 },
    {
     $lookup:
       {
         from: "businesses",
         localField: "_id",
         foreignField: "_id",
         as: "biz"
       }
     }
  ]);
  
  var toprestaurants = Analytics.aggregate([
    {"$group":{
        _id: '$bizid',
        count:{$sum:1}
      }
    },
    { "$sort": { "count": -1 } },
    { "$limit": 500},
    {
     $lookup:
       {
         from: "businesses",
         localField: "_id",
         foreignField: "_id",
         as: "biz"
       }
     },
     {
       $project :{
         count: '$count',
         category: {
           $filter: {
             input: "$biz",
             as: "biz",
             cond : [
                 { '$eq': ['$biz.subcategory', 'Restaurants']},
                     1,
                     0
             ]
           }
         }
       }
     }
  ]);

  var coupons = Coupons.find({
    status: true
  }).populate('bizid').sort([['order', 1],['star', -1]]).limit(5);
  var reviews = Review.find().sort([['created_at', -1]]).populate('bizid').populate('user_id').limit(5);
  var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);
  var description = "Business contact information, deals from the best businesses, shopping, special offers & much more only on Findit in Kenya."
  var keywords = "Findit,findit,Businesses,restaurants,Nairobi,Kenya,dentists,doctors,hotels,deals,special offers,lawyers,hospitals,salon,spa,pizza,movies,ice cream,shopping mall,bakeries";
  var title = 'Find the best businesses & services in Kenya, restaurants, lawyers, doctors, salons, findit';
  Promise.all([categories, toprestaurants, topsearches, coupons, reviews ]).then(values => {
    res.render('index', {
        title: title,
        categories: values[0],
        toprestaurants: values[1],
        topsearches: values[2],
        coupons: values[3],
        reviews: values[4],
        description: description,
        keywords: keywords,
        top: req.get('host')
    });
  });
});

router.get('/with-images', function(req, res, next) {
  Business.find({ paid: true }).select('slug photo paid').sort([['order', 1]])
  .then(function(data){
    res.json(data);
    data.forEach(function(element){
      element.photo = null;
      element.gallery = null;
      /*element.save(function(err){
        if(err)
          console.log(err);
      });*/
    });
  })
  .catch(function(err){
       console.log(err);
  });
});
//
router.get('/category/:cat',function(req, res, next){
  var page = 0;
  let lon = Number(req.query.lon);
  let lat = Number(req.query.lat);
  let point;
  if(req.query.page){
    page = req.query.page - 1;
  }
  if(req.params.cat == 'Events'){
    var businesses = Business.find({
      $query: {subcategory: req.params.cat, approved: true},
      $orderby: { starteventdate: -1 },
      "starteventdate": { $gt: new Date() }
    }).sort([['paid', -1],['datepaid', 1]]);
    var features = Category.aggregate([
      { $match: { name: req.params.cat } },
        { "$unwind": "$subcategories" },
      { "$sort": { "subcategories.name": 1 } }
    ]);
    var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);
    Promise.all([businesses, features, categories]).then(values => {
      //console.log(values[1]);
      console.log(url.parse(req.originalUrl));
      res.render('business/list', {
          title: req.params.cat,
          businesses: values[0],
          features: values[1],
          categories: values[2],
          host: req.get('host')
      });
    });
  }else{
    if (lon && lat){
      // if coordinates are provided
      point = {
        "type": "Point",
        "coordinates": [lon,lat]
      };

     var businesses = Business.aggregate([{
        '$geoNear': {
          'near': point,
          'spherical': true,
          "query":{
            subcategory: req.params.cat,
            approved: true,
            branch: { $ne: true }
          },
          'distanceField': 'distance',
          'maxDistance': 1000000000000
        }
      },
       { "$sort": { "paid": -1 } }
    ]);

      var bizcount = Business.count({
        subcategory: req.params.cat,
        approved: true
      });

      var features = Category.aggregate([
        { $match: { name: req.params.cat } },
        { "$unwind": "$subcategories" },
        { "$sort": { "subcategories.name": 1 } }
      ]);
//as
      var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);

      Promise.all([businesses, features, categories, bizcount]).then(values => {
        //console.log(values[0].length);
        let bizs = values[0];
        for(let i = 0; i < bizs.length; i++){
          if (typeof bizs[i].reviews == 'undefined'){
            bizs[i].reviews = [];
          }
          if (typeof bizs[i].features == 'undefined'){
            bizs[i].features = [];
          }
        }
        res.render('business/list', {
            title: "Best "+req.params.cat+ " in Nairobi Kenya",
            businesses: values[0],
            description: req.params.cat+" in Kenya",
            features: values[1],
            categories: values[2],
            category: req.params.cat,
            bizcount: Math.ceil(values[3]/20),
            host: req.get('host'),
            uri: req.path,
            page: page + 1
        });
      });
    }else{
      var businesses = Business.find({
        $query: {
          subcategory: req.params.cat,
          approved: true,
          branch: { $ne: true }
          //pending: { $ne: true }
        }
      })
      .sort([['paid', -1],['datepaid', 1],['slug', 1]])
      //.limit(20)
      //.skip(20 * page);

      var bizcount = Business.count({
          subcategory: req.params.cat,
          approved: true
      });

      var features = Category.aggregate([
        { $match: { name: req.params.cat } },
        { "$unwind": "$subcategories" },
        { "$sort": { "subcategories.name": 1 } }
      ]);

      var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);

      Promise.all([businesses, features, categories, bizcount]).then(values => {
        //console.log(values[0].length);
        res.render('business/list', {
            title: "Best "+req.params.cat+ " in Nairobi Kenya",
            description: req.params.cat+" in Kenya",
            businesses: values[0],
            features: values[1],
            categories: values[2],
            category: req.params.cat,
            bizcount: Math.ceil(values[3]/20),
            host: req.get('host'),
            uri: req.path,
            page: page + 1
        });
      });
    }
}
      //res.render('business/list', { title: 'Businesses on ', businesses: data});
});

router.get('/subcategory/:cat/:name', function(req, res, next){
  var businesses = Business.find({ features: req.params.name,branch:null, approved: true })
  .sort([['paid', -1],['datepaid', 1],['slug', 1]]);
  //var features = Category.findOne({ subcategories: {$elemMatch: { name: req.params.name}} });
  var features = Category.aggregate([
    { $match: { subcategories: {$elemMatch: { name: req.params.name}},group: 'general' } },
    { "$unwind": "$subcategories" },
    { "$sort": { "subcategories.name": 1 } }
  ]);
  var categories = Category.find({approved: true,group: 'general'}).sort([['order', 1]]);
  Promise.all([businesses,features, categories]).then(values => {
    res.render('business/list', {
        title: "Best "+req.params.name+ " In Kenya",
        businesses: values[0],
        features: values[1],
        categories: values[2],
        category: req.params.name,
        subcategory: req.params.name
    });
  });
});

router.get('/nearby/:category/', function(req, res, next){
  var businesses = Business.find({subcategory: req.params.category});
  //var features = Category.find({ subcategories: {$elemMatch: { name: req.params.category}} });

  var features = Category.findOne({ name: req.params.category ,group: 'general'});

  Promise.all([businesses, features]).then(values => {
    res.render('business/nearby', {
        title: req.params.category,
        businesses: values[0],
        features: values[1]
    });
  });
});

router.get('/nearby/:category/:name', function(req, res, next){
  var businesses = Business.find({subcategory: req.params.category, features: req.params.name});
  var features = Category.aggregate([
    { $match: { name: req.params.category ,group: 'general'} },
      { "$unwind": "$subcategories" },
    { "$sort": { "subcategories.name": 1 } }
  ]);
  Promise.all([businesses, features]).then(values => {
    res.render('business/nearby', {
        title: req.params.category,
        businesses: values[0],
        features: values[1][0],
        subcategory: req.params.name
    });
  });
});


router.get('/dashboard', role.auth, function(req, res){
  res.render('admin/index', {title: "Find It Dashboard"});
  /*if(req.user.role == 1){
    Business.find({})
    .then(function(data){
      res.render('admin/index', {title: "Find It Dashboard", businesses: data});
    })
    .catch(function(err){
       console.log(err);
    });
  }else{
    Business.find({
      user_id : res.locals.user.username
    })
    .then(function(data){
      res.render('admin/index', {title: "Find It Dashboard", businesses: data});
    })
    .catch(function(err){
       console.log(err);
    });
  }*/

});

router.get('/businesses', role.auth, function(req, res){
  if(req.user.role == 1){
    Business.find({})
    .then(function(data){
      res.json({ recordsTotal: data.length, data: data});
    })
    .catch(function(err){
      console.log(err);
    });
  }else{
    Business.find({
      user_id : res.locals.user.username
    })
    .then(function(data){
      res.json({ recordsTotal: data.length, data: data});
    })
    .catch(function(err){
      console.log(err);
    });
  }

});

router.get('/fetchbiz', role.auth, function(req, res) {
  if(req.user.role == 1){
    Business.find({})
    .sort({ name:1})
    .then(function (table) {
      res.json(table); // table.total, table.data
    })
  }else{
    Business.find({user_id: res.locals.user.username})
    .sort({ name:1})
    .then(function (table) {
      res.json(table); // table.total, table.data
    })
  }
});

router.get('/datatables', role.auth, function(req, res) {
  if(req.user.role == 1){
    Business.dataTables({
      limit: req.body.length,
      skip: req.body.start,
      sort: {
        name: 1
      }
    }).then(function (table) {
      res.json(table); // table.total, table.data
    })
  }else{
    Business.dataTables({
      limit: req.body.length,
      skip: req.body.start,
      find: {
        user_id: res.locals.user.username
      },
      sort: {
        name: 1
      }
    }).then(function (table) {
      res.json(table); // table.total, table.data
    })
  }
});

router.get('/profile', function(req, res){
  res.render('admin/profile', {title: "Profile"});
});

router.get('/editprofile', function(req, res){
  res.render('user/editprofile', {title: "Profile"});
});

router.post('/editprofile', function(req, res){
  User.findById(res.locals.user._id)
  .then(function(b){
    b.names = req.body.names;
    b.phone = req.body.phone;
    b.save(function(err){
      if(err){
        res.redirect('/editprofile');
      }else{
        req.flash('success_msg','Profile Updated');
        res.redirect('/dashboard');
      }
    });
  });
});

router.get('/login', function(req, res){
  res.render('user/login', {title: "Sign Up"});
});

router.get('/',(req,res)=>{

})

router.get('/register', function(req, res){
  var form = {
        nameholder: '',
        phoneholder: '',
        emailholder: ''
    };
  res.render('user/register', {title: "Login",form: form});
});

router.get('/welcome', function(req, res){
  res.render('welcome', {title: "email welcome"});
});

router.get('/terms-and-conditions',function(req, res, next){
  res.render('site/terms');
});

router.get('/privacy-policy',function(req, res, next){
  res.render('site/privacy');
});

router.get('/claim-form/:id/', role.auth, function(req, res, next){
  res.render('site/formclaim', {title: "Choose Package", bizid: req.params.id});
});

router.get('/add-agent',role.auth,function(req, res, next){
  res.render('site/agent');
});

router.get('/elasticmapping', function(req, res){
  Business.createMapping(function(err, mapping){
    if(err){
      console.log('error creating mapping (you can safely ignore this)');
      console.log(err);
    }else{
      console.log('mapping created!');
      console.log(mapping);
    }
  });
});

router.get('/indexsearch/:string', function(req, res){
  var search = Business.search(
    {query_string: {query: req.params.string}},
    {hydrate: true });
  Promise.all([search]).then(values => {
      res.render('business/list', {
          title: req.params.string,
          businesses: values[0].hits.hits,
          host: req.get('host')
      });
  });
});

router.get('/indexall', function(req, res){
  var stream = Business.synchronize();
  var count = 0;

  stream.on('data', function(err, doc){
    count++;
  });
  stream.on('close', function(){
    res.send('indexed ' + count + ' documents!');
  });
  stream.on('error', function(err){
    console.log(err);
    res.send(err);
  });
});

router.get('/elasticsearch', function(req, res){
  var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
  });
  client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
  }, function (error) {
    if (error) {
      console.trace('elasticsearch cluster is down!');
      res.send('elasticsearch cluster is down!');
    } else {
      res.send('All is well');
    }
  });
});

router.get('/pay/:bizid', function(req, res){
  Business.findById(req.params.bizid)
  .then(function(b){
    res.render('business/pay',{ biz: b });
  });
});

router.post('/claim/:id/', role.auth, function(req, res){
  ssn = req.session;
  ssn.hashkey = "852sokompare963001";
  ssn.vendor_id = "sokompare";
  var package = req.body.package;
  ssn.agentnumber = req.body.agentnumber;
  ssn.email = req.body.email;
  var amount = 0;
  if(package == "bronze"){
    //amount = "2320";
    amount = "2000";
  }else if(package == "silver"){
    amount = "5000";
  }else if(package == "gold"){
    amount = "12000";
  }
  var fields = {
    "live":"1",
    "oid": req.params.id,
    "inv": "invoiceid"+req.params.id,
    "ttl": amount,
    "tel": req.body.phone,
    "eml": req.body.email,
    "vid": ssn.vendor_id,
    "curr": "KES",
    "p1": req.params.id,
    "p2": "",
    "p3": "",
    "p4": "",
    "lbk": 'https://'+req.get('host')+'/cancel',
    "cbk": 'https://'+req.get('host')+'/receive',
    "cst": "1",
    "crl": "0"
  };
  var datastring =  fields['live']+fields['oid']+fields['inv']+
    fields['ttl']+fields['tel']+fields['eml']+fields['vid']+fields['curr']+fields['p1']+fields['p2']
    +fields['p3']+fields['p4']+fields['cbk']+fields['cst']+fields['crl'];
  var hash = crypto.createHmac('sha1',ssn.hashkey).update(datastring).digest('hex');
  res.render('business/claim', {title: "Pay",hash: hash, inputs: fields, datastring: datastring, package: package});
});

router.get('/receive', function(req, res){
  var val = "sokompare";
  var val1 = req.query.id;
  var val2 = req.query.ivm;
  var val3 = req.query.qwh;
  var val4 = req.query.afd;
  var val5 = req.query.poi;
  var val6 = req.query.uyt;
  var val7 = req.query.ifd;
  var bizId = req.query.p1;
  var array = req.query.p2;
  var status = req.query.status;
  var amount = req.query.mc;

  var ipnurl = "https://www.ipayafrica.com/ipn/?vendor="+val+"&id="+val1+"&ivm="+val2+"&qwh="+val3+"&afd="+val4+"&poi="+val5+"&uyt="+val6+"&ifd="+val7;
  //console.log(ipnurl);
  Business.findById(val1)
  .then(function(b){
    b.paid = true;
    b.amountpaid = amount;
    data.fakepaid = false;
    b.datepaid = new Date();
    b.user_id = res.locals.user.username;
    var ssn = req.session;
    b.agentphone = ssn.agentnumber;
    //if(amount == "2320"){
    if(amount == "2000.00"){
      b.packagepaid = "bronze";

          var holder = emailModel.app;
          var mailer = emailModel.mailer;
          holder.mailer.send('email/bronze', {
            to: ssn.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
            subject: 'Payment Confirmed', // REQUIRED.
            otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
          }, function (err) {
            if (err) {
              // handle error
              console.log(err);
              res.send('There was an error sending the email');
              return;
            }
          });
    }else if(amount == "5000.00"){
      b.packagepaid = "silver";
          var holder = emailModel.app;
          var mailer = emailModel.mailer;
          holder.mailer.send('email/silver', {
            to: ssn.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
            subject: 'Payment Confirmed', // REQUIRED.
            otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
          }, function (err) {
            if (err) {
              console.log(err);
              res.send('There was an error sending the email');
              return;
            }
          });
    }else if(amount == "12000.00"){
      b.packagepaid = "gold";
      var holder = emailModel.app;
          var mailer = emailModel.mailer;
          holder.mailer.send('email/gold', {
            to: ssn.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
            subject: 'Payment Confirmed', // REQUIRED.
            otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
          }, function (err) {
            if (err) {
              // handle error
              console.log(err);
              res.send('There was an error sending the email');
              return;
            }
          });
    }
    request(ipnurl, function (error, response, body) {
      //console.log(body); // Print the HTML for the Google homepage.
      //res.send("Status > " + status + ", Body > " +body);
      //res.end();
      if(body == status){
        var holder = emailModel.app;
        var mailer = emailModel.mailer;
        holder.mailer.send('email/bronze', {
          to: "kelvinchege@gmail.com", // REQUIRED. This can be a comma delimited string just like a normal email to field.
          subject: 'Payment Confirmed' + amount, // REQUIRED.
          otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
        }, function (err) {
          if (err) {
            // handle error
            console.log(err);
            res.send('There was an error sending the email');
            return;
          }
        });
        b.save(function(err){
          req.flash('success_msg', 'Payment Successfully Done!');
          if(err)
            res.redirect('/'+b.slug);
          res.redirect('/'+b.slug);
        });

      }else{
        req.flash('error', 'Transaction Already Authenticated!');
        res.redirect('/'+b.slug);
      }
    });
  })
  .catch(function(err){
    console.log(err);
  });
});

router.get('/agent/:slug', function(req, res){
  res.render('site/agent');
});

router.get('/forgotpassword', function(req, res){
  res.render('user/forgotpassword');
});

router.post('/resetpassword/:id', function(req, res){
  var rst = validator.equals(req.body.password, req.body.cpassword);
  if(rst == false){
    req.flash('error','Password Mismatch');
    res.redirect(ssn.returnUrl);
  }
  else if(req.body.password.length < 4){
    req.flash('error','Password Length Should be More Than Four Characters');
    res.redirect(ssn.returnUrl);
  }else{
    User.findById(req.params.id)
    .then(function(d){
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(req.body.password, salt);
      d.password = hash;
      d.save(function(err){
        if(err){
          req.flash('error','Some Error Occured, Kindly try again');
          res.redirect(ssn.returnUrl);
        }else{
          req.flash('success_msg','Password Changed Successfully');
          res.redirect('/login');
        }
      });
    })
    .catch(function(err){
       console.log(err);
    });
  }
});

router.get('/resetpassword/:id/:resetcode', function(req, res){
  User.findOne({
    _id: req.params.id,
    resetcode: req.params.resetcode
  })
  .then(function(d){
    if(!d){
      req.flash('error_msg','The Password Reset Link is not Valid');
      res.redirect('/forgotpassword');
    }else{
      ssn = req.session;
      ssn.returnUrl = req.originalUrl;
      res.render('user/passwordreset',{id: req.params.id});
    }
  })
  .catch(function(err){
     console.log(err);
  });
});


router.post('/forgotpassword', function(req, res){
  User.findOne({
    email: req.body.email
  })
  .then(function(d){
    if(d){
      var salt = bcrypt.genSaltSync(10);
      var date = new Date();
      var hash = md5(date.toString());

      d.resetcode = hash;
      d.save(function(err){
        if(err){
          req.flash('error', 'Error occured when updating agent number');
          res.redirect('/');
        }
        var holder = emailModel.app;
        var mailer = emailModel.mailer;
        holder.mailer.send('email/forgotpassword', {
          to: d.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
          subject: 'FindIt Password Recovery', // REQUIRED.
          forgotpasswordlink:  'https://' + req.get('host') + '/resetpassword/'+d.id+'/'+hash, // All additional properties are also passed to the template as local variables.
        }, function (err) {
          if (err) {
            // handle error
            console.log(err);
            res.send('There was an error sending the email');
            return;
          }else{
            req.flash('success_msg', 'Email Sent');
            res.redirect('/');
          }
        });

      });
    }else{
      req.flash('error_msg', 'Email address not found');
      res.redirect('/forgotpassword');
    }
    //END IF
  })
  .catch(function(err){
     req.flash('error_msg', 'Email Sent');
      res.redirect('/forgotpassword');
  });
});

router.post('/agent/:slug', function(req, res){
  Business.findOne({
    slug: req.params.slug
  })
  .then(function(data){
    data.agentphone = req.body.phone;
    data.save(function(err){
      console.log(err);
      if(err){
        req.flash('error', 'Error occured when updating agent number');
        res.redirect('/'+req.params.slug);
      }
      req.flash('success_msg', 'Agent number Successfully Updated');
      res.redirect('/'+req.params.slug);
    });
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  });
});

router.get('/biz/analytics/:bizid', function(req, res, next){
  var analytics = new Analytics();
    analytics.ip = req.headers['x-forwarded-for'];
    analytics.time = new Date();
    analytics.bizid = req.params.bizid;
    analytics.category = "2";
    analytics.save(function(err){
      if(err){
        console.log(err);
      }else{
        console.log("logged");
      }
    });

});

router.get('/coupons', function(req, res){
    var coupons = Coupons.find({
      status: true
    })
    .populate('bizid')
    .sort([['order', 1],['star', -1]]);

    var mycoupons = Coupons.find({
        'users.user_id' : res.locals.user.id,
        'status': true
      })
    .populate('bizid')
    .populate('users.user_id','status code')

    var groups = Coupons.aggregate([
      { $match: { status: true } },
      { "$sort": { "order": -1 ,"star": -1} },
      { "$limit": 500},
      {
       $lookup:
         {
           from: "businesses",
           localField: "bizid",
           foreignField: "_id",
           as: "biz"
         }
       },
       {
         $project :{
           name: '$name',
           type: '$type',
           tagline: '$tagline',
           photo: '$photo',
           ownerid : '$ownerid',
           description: '$description',
           status: '$status',
           bizid: {
             $filter: {
               input: "$biz",
               as: "biz",
               cond : [
                   { '$eq': ['$biz.subcategory', req.params.cat]},
                       1,
                       0
               ]
             }
           }
         }
       },
       {"$group":{
           _id: '$bizid.subcategory',
           count:{$sum:1}
         }
       }
      ]);

      var populars = Coupons.aggregate([
        { $match: { status: true } },
        {
         $lookup:
           {
             from: "businesses",
             localField: "bizid",
             foreignField: "_id",
             as: "biz"
           }
         },
         {
           $project :{
             name: '$name',
             type: '$type',
             tagline: '$tagline',
             photo: '$photo',
             ownerid : '$ownerid',
             description: '$description',
             status: '$status',
             biz: '$biz',
             noofcoupons: {$size : '$users'}
           }
         },
         { "$sort": { "noofcoupons": -1 } },
         { "$limit": 3}
        ]);


    var categories = Category.find({approved: true}).sort([['order', 1]]);
    Promise.all([ coupons, categories, groups, populars, mycoupons]).then(values => {
        //console.log("Mycoupons Size:"+values[4].length);
        res.render('coupons/index', {
            title: 'Findit: Deals in Kenya',
            coupons: values[0],
            categories: values[1],
            groups: values[2],
            populars: values[3],
            mycoupons: values[4],
            host: req.get('host')
        });
    });
});

router.get('/coupons/:cat',role.auth, function(req, res){
  var coupons = Coupons.aggregate([
    { $match: { status: true } },
    { "$sort": { "order": -1 ,"star": -1} },
    { "$limit": 500},
    {
     $lookup:
       {
         from: "businesses",
         localField: "bizid",
         foreignField: "_id",
         as: "biz"
       }
     },
     {
       $project :{
         name: '$name',
         type: '$type',
         tagline: '$tagline',
         photo: '$photo',
         ownerid : '$ownerid',
         description: '$description',
         status: '$status',
         bizid: {
           $filter: {
             input: "$biz",
             as: "biz",
             cond : [
                 { '$eq': ['$biz.subcategory', req.params.cat]},
                     1,
                     0
             ]
           }
         }
       }
     }
    ]);


    /*var coupons = Coupons.find({
      status: true
    })
    .populate('bizid')
    .sort([['order', -1],['star', -1]]);*/
    var categories = Category.find({approved: true}).sort([['order', 1]]);
    Promise.all([coupons,categories]).then(values => {
        //console.log(values[2]);
        res.render('coupons/index', {
            title: 'Coupons on Findit',
            coupons: values[0],
            categories: values[1],
            keywords: "Best deals on meals, households, services etc in Kenya",
            host: req.get('host')
        });
    });
});

router.get('/getcoupon/user/:id', function(req, res){
  if(res.locals.loggedin){
    couponCode = 'coupon-' + Math.random().toString(36).substr(2, 8);
    Coupons.findById(req.params.id)
      .populate('bizid')
      .then(function(coupon){
        if(coupon.users.some(function(x) { return x.user_id == res.locals.user.id })){
          res.json({msg: 'You Have Already Used This Coupon'});
        }else{
          coupon.users.push({
            user_id: res.locals.user.id,
            code: couponCode,
            status: true
          });
          coupon.save(function(err){
            if(err){
              res.json({msg: 'You Probably Had a Coupon From This Offer Already'});
            }else{
              res.json({msg: 'Coupon Obtained'});
            }
          });
        }

      })
      .catch(function(err){
           console.log(err);
      });
  }else{
    ssn = req.session;
		ssn.returnUrl = "/coupons";
    res.json({});
  }
});

router.get('/removecoupon/:id', role.auth, function(req, res){
  Coupons.findOne({
    'users.user_id' : req.params.id
  })
  .then(function(coupon){
    if(coupon.users.some(function(x) { return x.user_id == res.locals.user.id })){
      newusers = coupon.users.filter(function(el) {
          return el.user_id != req.params.id;
      });
      coupon.users = newusers;
      coupon.save(function(err){
        if(err){
          res.json({msg: 'Kindly try later'});
        }else{
          res.json({msg: 'Coupon Removed'});
        }
      });
    }else{
      res.json({msg: 'You done have this coupon'});
    }
  })
  .catch(function(err){
       console.log(err);
  });
});

router.get('/api/mycoupons', role.auth, function(req, res){
  Coupons.find({
      'users.user_id' : res.locals.user.id,
      'status': true
    })
  .populate('bizid')
  .populate('users.user_id','status code')
    .then(function(data){
      res.json({mycoupons: data, code: 100});
    })
    .catch(function(err){
      res.json({msg: 'Error Occured', code: 101});
    });

});

/*
router.get('/analytics/graph/:bizid', function(req, res, next){
  Analytics.aggregate([
    {"$match": { "bizid": req.params.bizid}},
    {
      $project: {
        yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$time" } },
        category: '$category'
      }
    },
    {"$group":{
        _id: '$yearMonthDay',
        contacts: {
          $sum: {
            '$cond': [
                { '$eq': ['$category', '2']},
                    1,
                    0
            ]
          }
        },
        views: {
          $sum: {
            '$cond': [
                { '$eq': ['$category', '3']},
                    1,
                    0
            ]
          }
        }
      }
    },
    { "$sort": { "_id": -1 } }
  ], function(err, rst){
    var result = Object.keys(rst).map(function(key) {
      return [Number(key), rst[key].views, rst[key].contacts];
    });
    res.send(result);
  });
});*/

router.get('/popular', function(req, res, next){
  Analytics.aggregate([
    {"$group":{
        _id: '$bizid',
        count:{$sum:1}
      }
    },
    { "$sort": { "count": -1 } },
    { "$limit": 5 },
    {
     $lookup:
       {
         from: "businesses",
         localField: "_id",
         foreignField: "_id",
         as: "biz"
       }
     }
  ], function(err, rst){
    res.json(rst);
  });
});

router.get('/popular/hotels', function(req, res, next){
  Analytics.aggregate([
    {"$group":{
        _id: '$bizid',
        count:{$sum:1}
      }
    },
    { "$sort": { "count": -1 } },
    { "$limit": 500},
    {
     $lookup:
       {
         from: "businesses",
         localField: "_id",
         foreignField: "_id",
         as: "biz"
       }
     },
     {
       $project :{
         count: '$count',
         category: {
           $filter: {
             input: "$biz",
             as: "biz",
             cond : [
                 { '$eq': ['$biz.subcategory', 'Restaurants']},
                     1,
                     0
             ]
           }
         }
       }
     }
  ], function(err, rst){
    res.json(rst);
  });
});

router.get('/preview/:name',function(req, res, next){
  Business.findOne({
    slug: req.params.name,
    approved: true
  })
  .then(function(data){
    var phones = data.phone.split(",");
    var emails = data.email.split(",");
    var now = moment();
    delete data.hours.$init;
    var openingTimesMoment = new OpeningTimes(data.hours, 'Africa/Nairobi');
    data.openstatus = openingTimesMoment.getStatus(now);

      if(data.paid == false || typeof data.paid === 'undefined'){
        description = data.name + ', '+ data.subcategory + ', ' + data.street +', '+data.city + ' Kenya';
        res.render('business/freedetail',{title: data.name, biz: data, phones: phones, emails: emails, preview: true});
        res.end();
      }else{
        description = data.description;
        res.render('business/detail',{title: data.name, biz: data, phones: phones, emails: emails, description: description, preview: true});
        res.end();
      }
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  });
});

router.get('/stemming/:name', function(req, res, next){
  Business.find(
    {$text: {$search: req.params.name}}
    , {score: {$meta: "textScore"}}
  )
   .limit(50)
   .sort({ score:{$meta:'textScore'}})
   .exec(function(err, docs) {
     res.send(docs);
    });
});

router.get('/replicate/:name',function(req,res){
  Business.findOneAndUpdate(
    {slug: req.params.name},
    {replicate:true},
    function(doc){
      console.log(doc)
    }
  )
  Business.findOne({
    slug: req.params.name
  }).then(console.log)
  res.redirect('/biz/'+req.params.name)
})

router.get('/biz/:name',function(req, res, next){
  Business.findOne({
    slug: req.params.name,
    approved: true
    //pending: { $ne: true }
  })
  .populate('bizparent')
  .then(function(data){
    //var phones = data.phone.split(/[\s,]+/);
    var phones = data.phone.split(/[,\/-]/);
    var emails = data.email.split(/[,\/-]/);
    var now = moment();
    delete data.hours.$init;
    //console.log(data);
    var openingTimesMoment = new OpeningTimes(data.hours, 'Africa/Nairobi');
    try {
      data.openstatus = openingTimesMoment.getStatus(now);
    }
    catch(err) {
        data.openstatus = {};
    }

    //if(req.headers['x-forwarded-for'].includes("66.249") || req.headers['x-forwarded-for'].includes("216.244.66.227")){
      console.log(req.headers['x-forwarded-for']);
    //}else{
      var analytics = new Analytics();
      analytics.ip = req.headers['x-forwarded-for'];
      analytics.time = new Date();
      analytics.bizid = data.id;
      analytics.category = "3";
      analytics.save(function(err){
        if(err){
          console.log(err);
        }else{
          console.log("logged");
        }
      });
    //}

    //coupons
    var coupons = Coupons.find({bizid: data.id});
    var products = Product.find({bizid: data.id}).populate('category');
    var categories = Category.find({approved: true}).sort([['order', 1]]);

    //SIMILAR BUSINESSES
    //"author": { "$in": userIds }


    var branches;
    let lon =req.query.lon ? Number(req.query.lon):36.8219;
    let lat =req.query.lat ? Number(req.query.lat):-1.2921;
    if (lon && lat){
      // if coordinates are provided
      var point = {
        "type": "Point",
        "coordinates": [lon,lat]
      };
      let parent = "a";
      if(data.branch){
        parent = data.bizparent._id;
      }else{
        parent = data._id;
      }
      var hq = Business.findById(parent);
      let similarPoint = {
        "type": "Point",
        "coordinates": [data.map.coordinates[0],data.map.coordinates[1]]
      };

      var businesses = Business.aggregate(
        [{
          '$geoNear': {
              'near': similarPoint,
              'spherical': true,
              "query": {
                "subcategory": data.subcategory,
                "features": { "$in": data.features },
                "slug": { "$ne": data.slug },
                "branch": { "$ne": true },
                "approved": true
              },
              'num':6,
              'distanceField': 'distance',
              'maxDistance': 200000
          }
      }]
    )

      var branches = Business.aggregate(
        	[{
        			'$geoNear': {
        					'near': point,
                  'spherical': true,
                  "query":{ bizparent: parent },
        					'distanceField': 'distance',
        					'maxDistance': 1000000000000
        			}
          }]);

      Promise.all([coupons,businesses,categories,branches,products,hq]).then(values => {
          var coupons = values[0];
          var businesses = values[1];
          var categories = values[2];
          var products = values[4];
          var branches;
          var hq = values[5];
          if(values[3].length){
             branches = values[3];
          }else{
             branches = null;
          }
          for(let i = 0; i < products.length; i++){
            if (products[i].category == null || products[i].category == ''){
              let val = {
                name: 'undefined'
              }
              products[i].category = val
            }
          }
          //array  of current businesses features
          let currentBusinessFeatures = data.features;

          currentBusinessFeatures.sort();

          let similarbusinesses = businesses;

          for(let i = 0; i < similarbusinesses.length;i++){

            for(let k = 0; k < similarbusinesses[i].features.length;k++){
              similarbusinesses[i].features =  similarbusinesses[i].features.filter(function(id) {
                return currentBusinessFeatures.indexOf(id) > -1;
              });
            }

          }
          if(data.paid == false || typeof data.paid === 'undefined'){
            description = data.name + ', '+ data.subcategory + ', ' + data.street +', '+data.city + ' Kenya';
            keywords = data.keywords + " | on Findit Kenya";
            res.render('business/freedetail',{
              title: data.name,
              biz: data,
              phones: phones,
              emails: emails,
              similarbiz: similarbusinesses,
              keywords: keywords,
              coupons: coupons,
              categories:categories,
              branches: branches,
              products: products,
            });
            //res.end();
          }else{
            description = data.description;
            keywords = data.keywords + " | on Findit Kenya";
            res.render('business/detail',{
              title: data.name,
              biz: data,
              phones: phones,
              emails: emails,
              description: description,
              similarbiz: businesses,
              keywords: keywords,
              coupons: coupons,
              categories:categories,
              branches: branches,
              products: products,
              hq:hq
            });
            //res.end();
          }
        });

    }else{
    // if client doesn't allow/support Location API
      var businesses = Business.find({
        $query: {
          subcategory: data.subcategory,
          features: { "$in": data.features },
          slug: { "$ne": data.slug },
          branch: { "$ne": true },
          approved: true
        }
      }).limit(10).sort({slug:1})
     branches = Business.find({bizparent: data._id});
     let parent = "a";
      if(data.branch){
        parent = data.bizparent._id;
      }else{
        parent = data._id;
      }
     var hq = Business.findById(parent);
     Promise.all([coupons,businesses,categories,branches,products,hq]).then(values => {
      var coupons = values[0];
      var businesses = values[1];
      var categories = values[2];
      var products = values[4];
      for(let i = 0; i < products.length; i++){
        if (products[i].category == null || products[i].category == ''){
          let val = {
            name: 'undefined'
          }
          products[i].category = val
        }
      }
      var branch;
      var hq = values[5];
      if(values[3].length){
      branch = values[3];
      }else{
      branch = null;
      }

      if(data.paid == false || typeof data.paid === 'undefined'){
        description = data.name + ', '+ data.subcategory + ', ' + data.street +', '+data.city + ' Kenya';
        keywords = data.keywords + " | on Findit Kenya";
        //console.log(description);
        res.render('business/freedetail',{
          title: data.name,
          biz: data,
          phones: phones,
          emails: emails,
          similarbiz: businesses,
          keywords: keywords,
          coupons: coupons,
          categories:categories,
          branches: branch,
          products: products,
        });
        //res.end();
      }else{
        description = data.description;
        keywords = data.keywords + " | on Findit Kenya";
        //console.log(description);
        res.render('business/detail',{
          title: data.name,
          biz: data,
          phones: phones,
          emails: emails,
          description: description,
          similarbiz: businesses,
          keywords: keywords,
          coupons: coupons,
          categories:categories,
          branches: branch,
          products: products,
          hq:hq
        });
        //res.end();
      }
    });
    }
  })
  .catch(function(err){
     console.log(err);
     res.redirect('/');
  });
});


router.get('/sitemap',function(req,res,next){

  var businesses = Business.find({},'slug name -_id')
  .sort([['paid', -1],['datepaid', 1],['slug', 1]])

  var categories = Category.find({},'slug name subcategories -_id').sort([['order', 1]]);

  var features = Category.aggregate([
    { "$unwind": "$subcategories" },
    { "$sort": { "subcategories.name": 1 } },
  ]);

  var products = Product.find({},'slug name bizid -_id').populate('category');

  Promise.all([businesses, features, categories,products]).then(values => {
    res.render('sitemap', {
        title: "Sitemap Findit Kenya",
        businesses: values[0],
        features: values[1],
        categories: values[2],
        products:values[3],
        host: req.get('host'),
        uri: req.path,
    });
  });
})

module.exports = router;
