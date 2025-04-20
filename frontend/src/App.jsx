import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import './App.css'; // Assuming your CSS is in App.css
import IPTVPlayer from './components/IPTVPlayer'; 
import Footer from './components/Footer';
import HLSStream from './components/HLSStream';
import Navbar from './components/Navbar';
import Player from './components/Player';
import {fetchAllChannels} from './components/api'; 
import Container from './components/Container'; 
import SelectionScreen from './components/SelectionScreen'; 
import Iframe from 'react-iframe'
import TVNZ from './components/TVNZ'; 
import TVGarden from './components/TVGarden';

function App() {
  // --- State ---
  const [streams, setStreams] = useState([
    { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', name: 'Mux Test Stream' },
    { url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', name: 'Sintel (Bitmovin)' },
    // { url: 'https://www.youtube.com/watch?v=LLqU2gTZxiA&t=5151s', name: 'YouTube Stream'},
  ]);

  const [youtubeStreams, setYoutubeStreams] = useState([
    { url: 'https://www.youtube.com/watch?v=fO9e9jnhYK8', name: 'ISS Space Station' },
    { url: 'https://www.youtube.com/watch?v=mhJRzQsLZGg', name: 'NASA Space Flight' },
    ]);

  // Updated IPTV list
  /*const [iptvChannels, setIptvChannels] = useState([
      {
        name: "Action Hollywood Movies",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg01076-lightningintern-actionhollywood-samsungnz/playlist.m3u8",
        category: "Movies",
        logo: "🎬"
      },
      {
        name: "Bloomberg Quicktake",
        url: "https://bloomberg-quicktake-4-nz.samsung.wurl.tv/playlist.m3u8",
        category: "News",
        logo: "📰"
      },
      {
        name: "Bloomberg TV",
        url: "https://bloomberg-bloomberg-2-nz.samsung.wurl.tv/playlist.m3u8",
        category: "News",
        logo: "📰"
      },
      {
        name: "Bounty",
        url: "https://bountyfilms-bounty-1-nz.samsung.wurl.tv/playlist.m3u8",
        category: "Movies",
        logo: "🎬"
      },
      {
        name: "CineView",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg01076-lightningintern-rialto-samsungnz/playlist.m3u8",
        category: "Movies",
        logo: "🎬"
      },
      {
        name: "Clubbing TV",
        url: "https://clubbingtv-samsungnz.amagi.tv/playlist.m3u8",
        category: "Music",
        logo: "🎵"
      },
      {
        name: "Drybar Comedy",
        url: "https://drybar-drybarcomedy-1-nz.samsung.wurl.tv/playlist.m3u8",
        category: "Entertainment",
        logo: "😂"
      },
      {
        name: "Dust",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00219-gunpowdersky-dustintlnz-samsungnz/playlist.m3u8",
        category: "Sci-Fi",
        logo: "👽"
      },
      {
        name: "EuroNews",
        url: "https://euronews-euronews-world-1-nz.samsung.wurl.tv/playlist.m3u8",
        category: "News",
        logo: "📰"
      },
      {
        name: "GB News",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg01076-lightningintern-gbnewsnz-samsungnz/playlist.m3u8",
        category: "News",
        logo: "📰"
      },
      {
        name: "Gusto TV",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg01077-gustoworldwidem-gustotvnz-samsungnz/playlist.m3u8",
        category: "Food",
        logo: "🍳"
      },
      {
        name: "Horse and Country Free",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00810-horsecountrytvl-hncfreenz-samsungnz/playlist.m3u8",
        category: "Lifestyle",
        logo: "🏇"
      },
      {
        name: "Introuble",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00861-terninternation-introublenz-samsungnz/playlist.m3u8",
        category: "Entertainment",
        logo: "🎭"
      },
      {
        name: "InWonder",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00861-terninternation-inwondernz-samsungnz/playlist.m3u8",
        category: "Entertainment",
        logo: "🎭"
      },
      {
        name: "Made in Hollywood",
        url: "https://connection3-ent-nz.samsung.wurl.tv/playlist.m3u8",
        category: "Entertainment",
        logo: "🎥"
      },
      {
        name: "Magellen TV",
        url: "https://magellantv-3-nz.samsung.wurl.tv/playlist.m3u8",
        category: "Documentary",
        logo: "🌍"
      },
      {
        name: "Motorvision.TV",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg01329-otterainc-motorvisionnz-samsungnz/playlist.m3u8",
        category: "Automotive",
        logo: "🏎️"
      },
      {
        name: "Nosey",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00514-noseybaxterllc-noseyintlnz-samsungnz/playlist.m3u8",
        category: "Entertainment",
        logo: "👀"
      },
      {
        name: "Now 70's",
        url: "https://lightning-now70s-samsungnz.amagi.tv/playlist.m3u8",
        category: "Music",
        logo: "🎵"
      },
      {
        name: "Now 80's",
        url: "https://lightning-now80s-samsungnz.amagi.tv/playlist.m3u8",
        category: "Music",
        logo: "🎵"
      },
      {
        name: "NOW Rock",
        url: "https://lightning-now90s-samsungnz.amagi.tv/playlist.m3u8",
        category: "Music",
        logo: "🎸"
      },
      {
        name: "Outdoor Channel",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00718-outdoorchannela-outdoortvnz-samsungnz/playlist.m3u8",
        category: "Outdoor",
        logo: "🌲"
      },
      {
        name: "Pet Club TV",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg01076-lightningintern-petclub-samsungnz/playlist.m3u8",
        category: "Animals",
        logo: "🐶"
      },
      {
        name: "Pulse TV",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg01076-lightningintern-pulse-samsungnz/playlist.m3u8",
        category: "Entertainment",
        logo: "💓"
      },
      {
        name: "Real Crime",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00426-littledotstudio-realcrimebetanz-samsungnz/playlist.m3u8",
        category: "Crime",
        logo: "🕵️"
      },
      {
        name: "Real Life",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00426-littledotstudio-reallifenz-samsungnz/playlist.m3u8",
        category: "Reality",
        logo: "📺"
      },
      {
        name: "Real Stories",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00426-littledotstudio-realstoriesnz-samsungnz/playlist.m3u8",
        category: "Documentary",
        logo: "📖"
      },
      {
        name: "Real Wild",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00426-littledotstudio-realwildnz-samsungnz/playlist.m3u8",
        category: "Nature",
        logo: "🌿"
      },
      {
        name: "Ryan and Friends",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00286-pocketwatch-ryanandfriends-samsungnz/playlist.m3u8",
        category: "Kids",
        logo: "👶"
      },
      {
        name: "Tastemade International",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00047-tastemade-tmintlaus-samsungnz/playlist.m3u8",
        category: "Food",
        logo: "🍽️"
      },
      {
        name: "The Design Network",
        url: "https://thedesignnetwork-tdn-1-nz.samsung.wurl.tv/playlist.m3u8",
        category: "Home",
        logo: "🏠"
      },
      {
        name: "Timeline",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00426-littledotstudio-timelinenz-samsungnz/playlist.m3u8",
        category: "History",
        logo: "⏳"
      },
      {
        name: "Trace Sports Stars 1", // Renamed slightly to avoid conflict if 'Trace Sports Stars' also exists below
        url: "https://trace-sportstars-samsungnz.amagi.tv/playlist.m3u8",
        category: "Sports",
        logo: "⚽"
      },
      {
        name: "Trace Urban",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg01076-lightningintern-traceurban-samsungnz/playlist.m3u8",
        category: "Music",
        logo: "🎵"
      },
      {
        name: "Travel XP",
        url: "https://travelxp-travelxp-1-nz.samsung.wurl.tv/playlist.m3u8",
        category: "Travel",
        logo: "✈️"
      },
      {
        name: "TrueCrimeNow",
        url: "https://alliantcontent-truecrimenow-3-nz.samsung.wurl.tv/playlist.m3u8",
        category: "Crime",
        logo: "🕵️"
      },
      {
        name: "Wonder",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg00426-littledotstudio-wondernz-samsungnz/playlist.m3u8",
        category: "Documentary",
        logo: "❓"
      },
      {
        name: "Zoo Moo",
        url: "https://cdn-apse1-prod.tsv2.amagi.tv/linear/amg01553-blueantmediaasi-zoomoonz-samsungnz/playlist.m3u8",
        category: "Kids",
        logo: "🦁"
      },
      // New Zealand Category
      {
        name: "Bravo +1",
        url: "https://i.mjh.nz/.r/bravo-plus1.m3u8",
        category: "NZ",
        logo: "🇳🇿"
      },
      {
        name: "Channel 200",
        url: "https://d1jlnqid3sfc6m.cloudfront.net/out/v1/3fc2254c865a457c8d7fbbce227a2aae/index.m3u8",
        category: "NZ",
        logo: "🇳🇿"
      },
      {
        name: "Firstlight",
        url: "https://uni01rtmp.tulix.tv/firstlight/firstlight.smil/playlist.m3u8",
        category: "NZ",
        logo: "🇳🇿"
      },
      {
        name: "Juice TV",
        url: "https://juicex.nz/hls/mystream.m3u8",
        category: "NZ",
        logo: "🇳🇿"
      },
      {
        name: "Kordia TV",
        url: "https://ptvlive.kordia.net.nz/out/v1/3fc2254c865a457c8d7fbbce227a2aae/index.m3u8",
        category: "NZ",
        logo: "🇳🇿"
      },
      {
        name: "Love Stories TV",
        url: "https://84e619480232400a842ce499d053458a.mediatailor.us-east-1.amazonaws.com/v1/manifest/04fd913bb278d8775298c26fdca9d9841f37601f/ONO_LoveStoriesTV/18a65393-ba3b-4912-90d5-7188c128ac66/3.m3u8",
        category: "NZ",
        logo: "🇳🇿"
      },
      {
        name: "Parliament TV",
        url: "https://ptvlive.kordia.net.nz/out/v1/daf20b9a9ec5449dadd734e50ce52b74/index.m3u8",
        category: "NZ",
        logo: "🏛️"
      },
      {
        name: "Sky Open",
        url: "https://primetv-prod.akamaized.net/v1/prime-freeview-aes128.m3u8",
        category: "NZ",
        logo: "🇳🇿",
        geoBlocked: true
      },
      {
        name: "Sky Open +1",
        url: "https://linear-p.media.skyone.co.nz/primeplus1.clear.m3u8",
        category: "NZ",
        logo: "🇳🇿",
        geoBlocked: true
      },
      {
        name: "Te Reo",
        url: "https://i.mjh.nz/.r/te-reo.m3u8",
        category: "NZ",
        logo: "🇳🇿"
      },
      {
        name: "TVNZ 1",
        url: "https://d2ce82tpc3p734.cloudfront.net/v1/master/b1f4432f8f95be9e629d97baabfed15b8cacd1f8/TVNZ_1/master.m3u8",
        category: "NZ",
        logo: "📺",
        geoBlocked: true
      },
      {
        name: "TVNZ 2",
        url: "https://duoak7vltfob0.cloudfront.net/v1/master/b1f4432f8f95be9e629d97baabfed15b8cacd1f8/TVNZ_2/master.m3u8",
        category: "NZ",
        logo: "📺",
        geoBlocked: true
      },
      {
        name: "TVNZ Duke",
        url: "https://dayqb844napyo.cloudfront.net/v1/master/b1f4432f8f95be9e629d97baabfed15b8cacd1f8/TVNZ_Duke/master.m3u8",
        category: "NZ",
        logo: "📺",
        geoBlocked: true
      },
      {
        name: "Wairarapa TV ",
        url: "https://stream1.np.co.nz/WAITVABR/WAITVABR/playlist.m3u8",
        category: "NZ",
        logo: "🇳🇿",
        not247: true
      },
      {
        name: "Wairarapa TV (Alt)",
        url: "https://stream.wairarapatv.co.nz/Broadband_High/playlist.m3u8",
        category: "NZ",
        logo: "🇳🇿",
        not247: true
      },
      {
        name: "Wairarapa TV ",
        url: "https://stream.wairarapatv.co.nz/Cellular_High/playlist.m3u8",
        category: "NZ",
        logo: "🇳🇿",
        not247: true
      },
      {
        name: "Whakaata Maori",
        url: "https://i.mjh.nz/.r/maori-tv.m3u8",
        category: "NZ",
        logo: "🌿"
      },
      {
        name: "Golf Kingdom",
        url: "https://30a-tv.com/feeds/vidaa/golf.m3u8",
        category: "Golf", // Changed
        logo: "⚽"
      },
      {
        name: "ACL Cornhole TV ",
        url: "https://1815337252.rsc.cdn77.org/HLS/CORNHOLETV.m3u8",
        category: "Sports", // Cornhole not in top 10 frequency
        logo: "⚽"
      },
      {
        name: "Abu Dhabi Sports 1 ",
        url: "https://vo-live-media.cdb.cdn.orange.com/Content/Channel/AbuDhabiSportsChannel1/HLS/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Abu Dhabi Sports 2 ",
        url: "https://tr-live-route.adm.tcon.hlit.hvds.tv/Content/Channel/AbuDhabiSportsChannel2/DASH/master.mpd",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Adventure Sports TV ",
        url: "https://d3rl6ns7c3ilda.cloudfront.net/scheduler/scheduleMaster/438.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Alfa Sport  [Not 24/7]",
        url: "https://dev.aftermind.xyz/edge-hls/unitrust/alfasports/index.m3u8?token=8TXWzhY3h6jrzqEqx",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Alkass Four ",
        url: "https://liveakgr.alkassdigital.net/hls/live/2097037/Alkass4cn/master.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Alkass One ",
        url: "https://liveakgr.alkassdigital.net/hls/live/2097037/Alkass1mhu/master.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Alkass SHOOF ",
        url: "https://liveakgr.alkassdigital.net/hls/live/2097037/Alkass6Shoof1/master.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Alkass Six ",
        url: "https://liveakgr.alkassdigital.net/hls/live/2097037/Alkass6buzat/master.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Alkass Three ",
        url: "https://liveakgr.alkassdigital.net/hls/live/2097037/Alkass3vak/master.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Alkass Two ",
        url: "https://liveakgr.alkassdigital.net/hls/live/2097037/Alkass2hef/master.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "All Sports ",
        url: "https://5cf4a2c2512a2.streamlock.net/dgrau/dgrau/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "AntenaSport  [Not 24/7]",
        url: "https://stream1.antenaplay.ro/as/asrolive1/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Arryadia ",
        url: "https://cdn.live.easybroadcast.io/abr_corp/73_arryadia_k2tgcj0/playlist_dvr.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Awapa Sports TV  [Not 24/7]",
        url: "https://mgv-awapa.akamaized.net/hls/live/2104282/MGV_CHANNEL15/master.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Bahrain Sports 1  [Not 24/7]",
        url: "https://5c7b683162943.streamlock.net/live/ngrp:sportsone_all/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Bahrain Sports 2  [Not 24/7]",
        url: "https://5c7b683162943.streamlock.net/live/ngrp:bahrainsportstwo_all/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Bellator MMA",
        url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5ebc8688f3697d00072f7cf8/master.m3u8?appName=web&appVersion=unknown&clientTime=0&deviceDNT=0&deviceId=6c26f5a6-30d3-11ef-9cf5-e9ddff8ff496&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&serverSideAds=false&sid=0e97a69e-3355-4217-b6fb-8952f0ad1803",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "Billiard TV ",
        url: "https://1621590671.rsc.cdn77.org/HLS/BILLIARDTV.m3u8",
        category: "Billiards", // Changed
        logo: "⚽"
      },
      {
        name: "Blue Sport 2 ",
        url: "http://62.210.211.188:2095/play/a00f",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "CBS Sports Golazo Network",
        url: "https://dai.google.com/linear/hls/event/GxrCGmwST0ixsrc_QgB6qw/master.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "CBS Sports HQ",
        url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5e9f2c05172a0f0007db4786/master.m3u8?appName=web&appVersion=unknown&clientTime=0&deviceDNT=0&deviceId=6c27b8f5-30d3-11ef-9cf5-e9ddff8ff496&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&serverSideAds=false&sid=3a15356b-8467-4ae7-b2f6-9c8467fcf41d",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "CBS Sports Network USA",
        url: "http://fl2.moveonjoy.com/CBS_SPORTS_NETWORK/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "CDN Deporte ",
        url: "https://rtmp-live-ingest-us-east-1-universe-dacast-com.akamaized.net/transmuxv1/streams/bc949011-1dd8-4d10-596c-f6910d4a9cf7.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "CDR ",
        url: "https://live-hls-xgod.livepush.io/live_cdn/emaf6CHYV7M-RQcL2/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "CIS TV ",
        url: "http://185.59.221.131:8081/live/cistv/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "CampusLore ",
        url: "https://linear-235.frequency.stream/dist/glewedtv/235/hls/master/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Canal+ Sport",
        url: "http://78.130.250.2:8023/play/a02v/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Champion TV ",
        url: "https://canal.mediaserver.com.co/live/ChampionTv.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Claro Sports Chile",
        url: "https://stitcher-ipv4.pluto.tv/v1/stitch/embed/hls/channel/6320d80a66666000086712d7livestitch/master.m3u8?advertisingId={PSID}&appVersion=unknown&deviceDNT={TARGETOPT}&deviceId={PSID}&deviceLat=0&deviceLon=0&deviceMake=samsung&deviceModel=samsung&deviceType=samsung-tvplus&deviceVersion=unknown&embedPartner=samsung-tvplus&profileFloor=&profileLimit=&profilesFromStream=true&samsung_app_domain={APP_DOMAIN}&samsung_app_name={APP_NAME}&us_privacy=1YNY",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "ColimdoT TV ",
        url: "https://cnn.livestreaminggroup.info:3132/live/colimdotvlive.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Combate Global",
        url: "https://stream.ads.ottera.tv/playlist.m3u8?network_id=960",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "Contacto Deportivo  [Not 24/7]",
        url: "https://live.obslivestream.com/cdeportivo/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "ČT Sport ",
        url: "http://88.212.15.19/live/test_ctsport_25p/playlist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "DF1 ",
        url: "https://dbjwcot8t7nyd.cloudfront.net/out/v1/9d068a9428444b458324ad77b5a0a4b8/index.m3u8",
        category: "Motorsports", // Changed (Implied Motorsport/Racing focus)
        logo: "⚽"
      },
      {
        name: "Dubai Racing ",
        url: "https://dmisdracta.cdn.mgmlcdn.com/events/smil:events.stream.smil/chunklist.m3u8",
        category: "Motorsports", // Changed (Racing) - Assuming motor/general racing
        logo: "⚽"
      },
      {
        name: "Dubai Racing 2 ",
        url: "https://dmithrvllta.cdn.mgmlcdn.com/dubairacing/smil:dubairacing.smil/chunklist.m3u8",
        category: "Motorsports", // Changed (Racing) - Assuming motor/general racing
        logo: "⚽"
      },
      {
        name: "Dubai Racing 3 ",
        url: "https://dmithrvllta.cdn.mgmlcdn.com/dubaimubasher/smil:dubaimubasher.smil/chunklist.m3u8",
        category: "Motorsports", // Changed (Racing) - Assuming motor/general racing
        logo: "⚽"
      },
      {
        name: "Dubai Sports 1 ",
        url: "https://dmidspta.cdn.mgmlcdn.com/dubaisports/smil:dubaisports.stream.smil/chunklist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Dubai Sports 2 ",
        url: "https://dmitwlvvll.cdn.mgmlcdn.com/dubaisportshd/smil:dubaisportshd.smil/chunklist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Dubai Sports 3  [Not 24/7]",
        url: "https://dmitwlvvll.cdn.mgmlcdn.com/dubaisportshd5/smil:dubaisportshd5.smil/chunklist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "EDGEsport ",
        url: "https://edgesport-samsunguk.amagi.tv/playlist.m3u8",
        category: "Sports", // General Action Sports
        logo: "⚽"
      },
      {
        name: "ERT Sports 1 ",
        url: "http://hbbtvapp.ert.gr/stream.php/v/vid_ertsports_mpeg.2ts",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "ERT Sports 2 ",
        url: "http://hbbtvapp.ert.gr/stream.php/v/vid_ertplay2_mpeg.2ts",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "ESPN U ",
        url: "http://fl2.moveonjoy.com/ESPN_U/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "ESPNews ",
        url: "http://fl2.moveonjoy.com/ESPN_NEWS/index.m3u8",
        category: "Sports", // General Network (News Focus)
        logo: "⚽"
      },
      {
        name: "ESR 24x7 eSports Network ",
        url: "https://eyeonesports.com/ES2RA-628g.m3u8",
        category: "eSports", // Changed
        logo: "⚽"
      },
      {
        name: "ESTV ",
        url: "https://estv-rakuten-samsung.amagi.tv/playlist.m3u8",
        category: "eSports", // Changed
        logo: "⚽"
      },
      {
        name: "Egg Network ",
        url: "http://210.210.155.37/uq2663/h/h22/index.m3u8",
        category: "eSports", // Changed
        logo: "⚽"
      },
      {
        name: "Eleven Sports 1 (2160p)",
        url: "http://9b129915.akadatel.com/iptv/83GA6FAV4DPTPQ/20068/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Eleven Sports 2 ",
        url: "http://109.233.89.166/Eleven_Sports_2_HD/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Eleven Sports 3 ",
        url: "http://109.233.89.166/Eleven_Sports_3_HD/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Eleven Sports 4 ",
        url: "http://109.233.89.166/ELEVEN_SPORTS_4_HD/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "FL Sport ",
        url: "https://tvsw5-hls.secdn.net/tvsw5-chorigin/play/prod-8ce1fcb47fa7474d84640eb766f0ef38/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "FTV ",
        url: "https://master.tucableip.com/ftv/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "FUTV Costa Rica ",
        url: "http://45.190.187.226:58092/play/a00q",
        category: "Football", // Changed (Futbol implied)
        logo: "⚽"
      },
      {
        name: "Fast Sports",
        url: "http://stream01.vnet.am/Channel_131/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Fight",
        url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5812b0f2237a6ff45d16c3f9/master.m3u8?appName=web&appVersion=unknown&clientTime=0&deviceDNT=0&deviceId=6c28ca64-30d3-11ef-9cf5-e9ddff8ff496&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&serverSideAds=false&sid=5722f4bc-fbe1-409f-ad8f-4559e5ebda2f",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "Fight Klub)",
        url: "http://185.236.229.62:9981/play/a02l",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "Fight Network",
        url: "https://d12a2vxqkkh1bo.cloudfront.net/hls/main.m3u8",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "Fight Night ",
        url: "https://origin3.afxp.telemedia.co.za/PremiumFree/fightnight/playlist.m3u8",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "FightBox",
        url: "http://stream01.vnet.am/Fightbox/mono.m3u8",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "Fite  [Not 24/7]",
        url: "https://cdn-cf.fite.tv/linear/fite247/playlist.m3u8",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "FITE 24/7 ",
        url: "https://d3d85c7qkywguj.cloudfront.net/scheduler/scheduleMaster/263.m3u8",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "Fox Sports en Espanol ",
        url: "https://apollo.production-public.tubi.io/live/fox-sports-espanol.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "FUEL TV ",
        url: "https://amg01074-fueltv-fueltvemeaen-rakuten-b6j62.amagi.tv/hls/amagi_hls_data_rakutenAA-fueltvemeaen/CDN/master.m3u8",
        category: "Motorsports", // Changed (Action/Motorsports focus)
        logo: "⚽"
      },
      {
        name: "Futbol ",
        url: "https://live.teleradiocom.tj/8/3m.m3u8",
        category: "Football", // Changed
        logo: "⚽"
      },
      {
        name: "Game Channel",
        url: "http://49.113.179.174:4022/udp/238.125.1.36:5140",
        category: "eSports", // Changed
        logo: "⚽"
      },
      {
        name: "Game+ ",
        url: "https://a-cdn.klowdtv.com/live2/fntsy_720p/playlist.m3u8",
        category: "Sports", // General (could be eSports, but name is generic)
        logo: "⚽"
      },
      {
        name: "Gaora Sports (544p)",
        url: "http://cdns.jp-primehome.com:8000/zhongying/live/playlist.m3u8?cid=cs17&isp=4",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Glory Kickboxing ",
        url: "https://6f972d29.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0dsb3J5S2lja2JveGluZ19ITFM/playlist.m3u8",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "Golf Channel",
        url: "http://fl2.moveonjoy.com/GOLF_CHANNEL/index.m3u8",
        category: "Golf", // Changed
        logo: "⚽"
      },
      {
        name: "Golf Channel ",
        url: "http://185.236.229.62:9981/play/a03m",
        category: "Golf", // Changed
        logo: "⚽"
      },
      {
        name: "Golf Network (540p)",
        url: "http://202.60.106.14:8080/1335/playlist.m3u8",
        category: "Golf", // Changed
        logo: "⚽"
      },
      {
        name: "HTSpor TV ",
        url: "http://185.234.111.229:8000/play/a016",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Hard Knocks  [Not 24/7]",
        url: "https://d3uyzhwvmemdyf.cloudfront.net/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/HardKnocks-SportsTribal/121.m3u8",
        category: "Combat Sports", // Changed (Boxing/MMA implied)
        logo: "⚽"
      },
      {
        name: "HorseTV ",
        url: "https://a-cdn.klowdtv.com/live2/horsetv_720p/playlist.m3u8",
        category: "Horse Racing", // Changed
        logo: "⚽"
      },
      {
        name: "IMPACT Plus! ",
        url: "https://d2tuwvs0ja335j.cloudfront.net/hls/main.m3u8",
        category: "Combat Sports", // Changed (Wrestling)
        logo: "⚽"
      },
      {
        name: "Idman TV",
        url: "https://str.yodacdn.net/idman/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Insight TV ",
        url: "https://insighttv-samsungau.amagi.tv/playlist.m3u8",
        category: "Sports", // General Action/Adventure
        logo: "⚽"
      },
      {
        name: "K19",
        url: "https://1853185335.rsc.cdn77.org/K192/tv/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "KCMN-LD6 ",
        url: "https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg02873-kravemedia-mtrspt1-distrotv/playlist.m3u8",
        category: "Motorsports", // Changed (mtrspt1 in URL)
        logo: "⚽"
      },
      {
        name: "KTV Sport ",
        url: "https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "KTV Sport Plus ",
        url: "https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Kozoom TV",
        url: "https://streams2.sofast.tv/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/fdd6f243-f971-4a1a-9510-97ac01d6b37f/manifest.m3u8",
        category: "Billiards", // Changed (Kozoom is known for Billiards)
        logo: "⚽"
      },
      {
        name: "L'Equipe",
        url: "https://raw.githubusercontent.com/ipstreet312/freeiptv/master/ressources/dmotion/py/eqpe/equipe.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Lacrosse TV ",
        url: "https://1840769862.rsc.cdn77.org/FTF/LSN_SCTE.m3u8",
        category: "Sports", // Lacrosse not in top 10 frequency
        logo: "⚽"
      },
      {
        name: "Lóverseny közvetítés (420p)",
        url: "http://87.229.103.60:1935/liverelay/loverseny2.sdp/playlist.m3u8",
        category: "Horse Racing", // Changed
        logo: "⚽"
      },
      {
        name: "MAV Select USA",
        url: "https://d3h07n6l1exhds.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-0z2yyo4dxctc7/playlist.m3u8",
        category: "Motorsports", // Changed
        logo: "⚽"
      },
      {
        name: "MLB Network",
        url: "http://fl2.moveonjoy.com/MLB_NETWORK/index.m3u8",
        category: "Baseball", // Changed
        logo: "⚽"
      },
      {
        name: "MNB Sport ",
        url: "https://cdn3.skygo.mn/live/disk1/MNBSport/DASH-FTA/MNBSport.mpd",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "MSG",
        url: "http://fl3.moveonjoy.com/MSG/index.m3u8",
        category: "Sports", // General Network (Regional)
        logo: "⚽"
      },
      {
        name: "MSG Plus ",
        url: "https://tvpass.org/live/msg-plus/hd",
        category: "Sports", // General Network (Regional)
        logo: "⚽"
      },
      {
        name: "MUTV ",
        url: "https://bcovlive-a.akamaihd.net/r2d2c4ca5bf57456fb1d16255c1a535c8/eu-west-1/6058004203001/playlist.m3u8",
        category: "Football", // Changed (Manchester United TV)
        logo: "⚽"
      },
      {
        name: "MadeinBO TV ",
        url: "https://srvx1.selftv.video/dmchannel/live/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Monterrico TV  [Not 24/7]",
        url: "https://ed3od.live.opencaster.com/jcpstream_hd720/index.m3u8",
        category: "Horse Racing", // Changed
        logo: "⚽"
      },
      {
        name: "More Than Sports TV ",
        url: "https://mts1.iptv-playoutcenter.de/mts/mts-web/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Motorsport.tv ",
        url: "https://9e2ee5d5.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X01vdG9yc3BvcnR0dl9ITFM/playlist.m3u8",
        category: "Motorsports", // Changed
        logo: "⚽"
      },
      {
        name: "Multivisión Sports  [Not 24/7]",
        url: "https://stream.digitalgt.com:3605/live/multivisionsportslive.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "NHRA TV ",
        url: "https://apollo.production-public.tubi.io/live/ac-nhra.m3u8",
        category: "Motorsports", // Changed (Drag Racing)
        logo: "⚽"
      },
      {
        name: "NHL",
        url: "https://nhl-firetv.amagi.tv/playlist.m3u8",
        category: "Sports", // Hockey not in top 10 frequency
        logo: "⚽"
      },
      {
        name: "NTV Spor",
        url: "http://46.4.193.238:8484/hls/ntvspor/playlist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Nautical Channel ",
        url: "https://a-cdn.klowdtv.com/live2/nautical_720p/playlist.m3u8",
        category: "Sports", // Water Sports - niche
        logo: "⚽"
      },
      {
        name: "NBC Sports Bay Area",
        url: "https://v1.thetvapp.to/hls/nbc-sports-bay-area/index.m3u8",
        category: "Sports", // General Network (Regional)
        logo: "⚽"
      },
      {
        name: "NBC Sports Boston",
        url: "https://v1.thetvapp.to/hls/nbc-sports-boston/index.m3u8",
        category: "Sports", // General Network (Regional)
        logo: "⚽"
      },
      {
        name: "NBC Sports Philadelphia",
        url: "https://v1.thetvapp.to/hls/nbc-sports-philadelphia/index.m3u8",
        category: "Sports", // General Network (Regional)
        logo: "⚽"
      },
      {
        name: "NFL Channel",
        url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5ced7d5df64be98e07ed47b6/master.m3u8?appName=web&appVersion=unknown&clientTime=0&deviceDNT=0&deviceId=6c2a5105-30d3-11ef-9cf5-e9ddff8ff496&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&serverSideAds=false&sid=6477ef85-3680-442c-94d8-27197903b1f6",
        category: "Football", // Changed
        logo: "⚽"
      },
      {
        name: "NFL Network",
        url: "http://fl2.moveonjoy.com/NFL_NETWORK/index.m3u8",
        category: "Football", // Changed
        logo: "⚽"
      },
      {
        name: "NFL RedZone",
        url: "http://fl1.moveonjoy.com/NFL_RedZone/index.m3u8",
        category: "Football", // Changed
        logo: "⚽"
      },
      {
        name: "Nittele G Plus (544p)",
        url: "http://cdns.jp-primehome.com:8000/zhongying/live/playlist.m3u8?cid=cs02&isp=4",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "OMONOIA TV (684p)",
        url: "http://62.233.57.226:8001/play/a00b00",
        category: "Football", // Changed (Omonoia is a football club)
        logo: "⚽"
      },
      {
        name: "Oman Sports TV  [Not 24/7]",
        url: "https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "One Golf ",
        url: "http://162.250.201.58:6211/pk/ONEGOLF/index.m3u8",
        category: "Golf", // Changed
        logo: "⚽"
      },
      {
        name: "Ovacion TV  [Not 24/7]",
        url: "http://cdn2.ujjina.com:1935/iptvovacion1/liveovacion1tv/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "PBR RidePass",
        url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/60d39387706fe50007fda8e8/master.m3u8?appName=web&appVersion=unknown&clientTime=0&deviceDNT=0&deviceId=6c2a9f21-30d3-11ef-9cf5-e9ddff8ff496&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&serverSideAds=false&sid=f7275d4e-aa8e-4e8d-9d5e-6a5665bf8190",
        category: "Sports", // Rodeo/Bull Riding - niche
        logo: "⚽"
      },
      {
        name: "PGA Tour",
        url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5de94dacb394a300099fa22a/master.m3u8?appName=web&appVersion=unknown&clientTime=0&deviceDNT=0&deviceId=6c2ac630-30d3-11ef-9cf5-e9ddff8ff496&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&serverSideAds=false&sid=6c2b7359-0375-4f34-996b-4fb9429ead78",
        category: "Golf", // Changed
        logo: "⚽"
      },
      {
        name: "PTV Sports",
        url: "http://121.91.61.106:8000/play/a00l/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Pac12 Insider ",
        url: "https://pac12-sportstribal.amagi.tv/playlist.m3u8",
        category: "Sports", // General Network (College)
        logo: "⚽"
      },
      {
        name: "Persiana Sport",
        url: "https://persiana.mastercast.cloud/memfs/f1accec0-3b52-476b-ada9-65f74ead985e.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Pluto TV Deportes ",
        url: "https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5dcde07af1c85b0009b18651/master.m3u8?advertisingId=&appName=web&appVersion=5.14.0-0f5ca04c21649b8c8aad4e56266a23b96d73b83a&app_name=web&clientDeviceType=0&clientID=6fbead95-26b1-415d-998f-1bdef62d10be&clientModelNumber=na&deviceDNT=false&deviceId=6fbead95-26b1-415d-998f-1bdef62d10be&deviceLat=19.4358&deviceLon=-99.1441&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=88.0.4324.150&marketingRegion=VE&serverSideAds=false&sessionID=b8e5a857-714a-11eb-b532-0242ac110002&sid=b8e5a857-714a-11eb-b532-0242ac110002&userId=",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Pluto TV Lucha Libre AAA ",
        url: "https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5c01df1759ee03633e7b272c/master.m3u8?advertisingId=&appName=web&appStoreUrl=&appVersion=DNT&app_name=&architecture=&buildVersion=&deviceDNT=0&deviceId=5c01df1759ee03633e7b272c&deviceLat=&deviceLon=&deviceMake=web&deviceModel=web&deviceType=web&deviceVersion=DNT&includeExtendedEvents=false&marketingRegion=US&serverSideAds=false&sid=971&terminate=false&userId=",
        category: "Combat Sports", // Changed (Wrestling)
        logo: "⚽"
      },
      {
        name: "Pluto TV Sports",
        url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/56340779a738201b4ccfeac9/master.m3u8?appName=web&appVersion=unknown&clientTime=0&deviceDNT=0&deviceId=6c2b3b63-30d3-11ef-9cf5-e9ddff8ff496&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&serverSideAds=false&sid=8673a43c-58ba-48b3-8db5-75986abb01b9",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Poker Night in America ",
        url: "https://d2njbreu8qyfxo.cloudfront.net/scheduler/scheduleMaster/216.m3u8",
        category: "Poker", // Changed
        logo: "⚽"
      },
      {
        name: "Poker TV ",
        url: "https://hls.pokertvfa.live/hls/stream.m3u8",
        category: "Poker", // Changed
        logo: "⚽"
      },
      {
        name: "PokerGo",
        url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5fc54366b04b2300072e31af/master.m3u8?appName=web&appVersion=unknown&clientTime=0&deviceDNT=0&deviceId=6c2b6274-30d3-11ef-9cf5-e9ddff8ff496&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&serverSideAds=false&sid=a68d07ef-a794-43f8-a287-3bd7f27d909b",
        category: "Poker", // Changed
        logo: "⚽"
      },
      {
        name: "Polsat Sport ",
        url: "http://109.233.89.170/Polsat_Sport_HD/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Polsat Sport Extra ",
        url: "http://109.233.89.170/Polsat_Sport_Extra_HD/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Polsat Sport Fight ",
        url: "http://109.233.89.170/Polsat_Sport_Fight_HD/index.m3u8",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "RTA Sport ",
        url: "https://rtatv.akamaized.net/Content/HLS/Live/channel(RTA3)/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "RTI La 3  [Not 24/7]",
        url: "https://www.enovativecdn.com/rticdn/smil:rti3.smil/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Racing America ",
        url: "https://livetv-fa.tubi.video/racing-america/playlist.m3u8",
        category: "Motorsports", // Changed
        logo: "⚽"
      },
      {
        name: "Racing.com ",
        url: "https://racingvic-i.akamaized.net/hls/live/598695/racingvic/index1500.m3u8",
        category: "Horse Racing", // Changed
        logo: "⚽"
      },
      {
        name: "Real Madrid TV (404p)",
        url: "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8",
        category: "Football", // Changed (Club Channel)
        logo: "⚽"
      },
      {
        name: "Realitatea Sportivă ",
        url: "https://stream.realitatea.net/realitatea/sportiva_md/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Red Bull TV ",
        url: "https://3ea22335.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWdiX1JlZEJ1bGxUVl9ITFM/playlist.m3u8",
        category: "Sports", // Extreme/Action Sports - keeping general
        logo: "⚽"
      },
      {
        name: "RightNow TV ",
        url: "https://a-cdn.klowdtv.com/live2/rightnowtv_720p/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "S Sport",
        url: "https://bcovlive-a.akamaihd.net/540fcb034b144b848e7ff887f61a293a/eu-central-1/6415845530001/profile_0/chunklist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "S Sport 2",
        url: "https://bcovlive-a.akamaihd.net/29c60f23ea4840ba8726925a77fcfd0b/eu-central-1/6415845530001/profile_0/chunklist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "SEO TV 5 Deportes  [Not 24/7]",
        url: "https://seo.tv.bo/tv/SEOtv_5sd.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "SKI TV  [Not 24/7]",
        url: "https://d2xeo83q8fcni6.cloudfront.net/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/SkiTV-SportsTribal/193.m3u8",
        category: "Sports", // Skiing not in top 10 frequency
        logo: "⚽"
      },
      {
        name: "SMG Football Channel",
        url: "http://49.113.179.174:4022/udp/238.125.2.142:5140",
        category: "Football", // Changed
        logo: "⚽"
      },
      {
        name: "SOS Kanal Plus ",
        url: "https://53be5ef2d13aa.streamlock.net/soskanalplus/soskanalplus.stream/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      // {
      //   name: "SPOTV (Indonesia)",
      //   url: "https://cdn09jtedge.indihometv.com/joss/133/beib1/index.m3u8",
      //   category: "Sports", // General Network
      //   logo: "⚽"
      // },
      // {
      //   name: "SPOTV 2 (Indonesia)",
      //   url: "https://cdn09jtedge.indihometv.com/joss/133/beib2/index.m3u8",
      //   category: "Sports", // General Network
      //   logo: "⚽"
      // },
      {
        name: "SSC Action Waleed  [Not 24/7]",
        url: "https://shls-live-event2-prod-dub.shahid.net/out/v1/0456ede1a39145d98b3d8c8062ddc998/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "San Marino RTV Sport ",
        url: "https://d2hrvno5bw6tg2.cloudfront.net/smrtv-ch02/smil:ch-02.smil/master.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Sharjah Sports TV ",
        url: "https://svs.itworkscdn.net/smc4sportslive/smc4.smil/playlist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Sony Six HD ",
        url: "http://103.81.104.118/hls/stream10.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Sport En France ",
        url: "https://sp1564435593.mytvchain.info/live/sp1564435593/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "Sportitalia SoloCalcio",
        url: "https://di-g7ij0rwh.vo.lswcdn.net/sportitalia/sisolocalcio.smil/playlist.m3u8",
        category: "Football", // Changed (Calcio = Football)
        logo: "⚽"
      },
      {
        name: "Sports Connect ",
        url: "https://origin3.afxp.telemedia.co.za/PremiumFree/sportsconnect/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "SportsGrid ",
        url: "https://sportsgrid-tribal.amagi.tv/playlist.m3u8",
        category: "Sports", // Betting/Stats focus - keeping general
        logo: "⚽"
      },
      {
        name: "SportsNet New York (540p)",
        url: "http://fl2.moveonjoy.com/SNY/index.m3u8",
        category: "Sports", // General Network (Regional)
        logo: "⚽"
      },
      {
        name: "Sportsman Channel",
        url: "http://fl2.moveonjoy.com/SPORTSMAN_CHANNEL/index.m3u8",
        category: "Sports", // Hunting/Fishing focus - keeping general
        logo: "⚽"
      },
      {
        name: "Stadium ",
        url: "https://apollo.production-public.tubi.io/live/ac-stadium2.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Swerve Sports ",
        url: "https://linear-253.frequency.stream/dist/glewedtv/253/hls/master/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "T Sports 7 ",
        url: "https://lb1-live-mv.v2h-cdn.com/hls/ffef/tsport/tsport.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TDM Sports Ch. 93 ",
        url: "https://live3.tdm.com.mo/ch4/sport_ch4.live/playlist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TNA Wrestling ",
        url: "https://d3mwqwqfak7y2q.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/ImpactWrestling-prod/hls/main.m3u8",
        category: "Combat Sports", // Changed (Wrestling)
        logo: "⚽"
      },
      {
        name: "TR Sport ",
        url: "https://livetr.teleromagna.it/mia/live/playlist.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TRT Spor ",
        url: "http://185.234.111.229:8000/play/a00e",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TSN1 ",
        url: "http://fl5.moveonjoy.com/TSN_1/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TSN2",
        url: "http://fl5.moveonjoy.com/TSN_2/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TSN3",
        url: "http://fl5.moveonjoy.com/TSN_3/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TSN4",
        url: "http://fl5.moveonjoy.com/TSN_4/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TSN5",
        url: "http://fl5.moveonjoy.com/TSN_5/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TV 2 Sport 1 ",
        url: "https://ws31-hls-live.akamaized.net/out/u/1416253.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TVMatic Fight ",
        url: "http://cdn.tvmatic.net/fight.m3u8",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "TVP Sport ",
        url: "http://109.233.89.166/TVP_Sport_HD/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TVQ Sports ",
        url: "https://dacastmmd.mmdlive.lldns.net/dacastmmd/1b6bbade53634f5a847b953c9adfd102/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "TVRI Sport ",
        url: "https://ott-balancer.tvri.go.id/live/eds/SportHD/hls/SportHD.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "TVS Bowling Network ",
        url: "https://bozztv.com/gusa/gusa-tvsbowling/index.m3u8",
        category: "Bowling", // Changed
        logo: "⚽"
      },
      {
        name: "TVS Boxing ",
        url: "https://bozztv.com/gusa/gusa-tvsboxing/index.m3u8",
        category: "Combat Sports", // Changed
        logo: "⚽"
      },
      {
        name: "TVS Classic Sports ",
        url: "https://bozztv.com/gusa/gusa-tvs/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "TVS Sports  [Not 24/7]",
        url: "https://bozztv.com/gusa/gusa-tvssports/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "TVS Sports Bureau ",
        url: "https://bozztv.com/gusa/gusa-tvssportsbureau/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "TVS Turbo ",
        url: "https://bozztv.com/gusa/gusa-tvsturbo/index.m3u8",
        category: "Motorsports", // Changed (Turbo implies motor)
        logo: "⚽"
      },
      {
        name: "TVS Women Sports ",
        url: "https://bozztv.com/gusa/gusa-tvswsn/index.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "talkSPORT ",
        url: "https://af7a8b4e.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/TEctZ2JfdGFsa1NQT1JUX0hMUw/playlist.m3u8",
        category: "Sports", // Talk Radio format - keeping general
        logo: "⚽"
      },
      {
        name: "Teletrak ",
        url: "https://unlimited6-cl.dps.live/sportinghd/sportinghd.smil/playlist.m3u8",
        category: "Horse Racing", // Changed
        logo: "⚽"
      },
      {
        name: "Ten Sports Pakistan",
        url: "http://121.91.61.106:8000/play/a04h/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Tennis Channel",
        url: "https://cdn-ue1-prod.tsv2.amagi.tv/linear/amg01444-tennischannelth-tennischannelnl-samsungnl/playlist.m3u8",
        category: "Sports", // Tennis not in top 10 frequency
        logo: "⚽"
      },
      {
        name: "Tigo Sports (Costa Rica)",
        url: "https://acceso.radiosportstv.online:3795/stream/play.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Tigo Sports (Guatemala)",
        url: "https://cnm-tsl.otteravision.com/cnm/tsl/tsl.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Trace Sport Stars (Australia) ",
        url: "https://lightning-tracesport-samsungau.amagi.tv/playlist.m3u8",
        category: "Sports", // Lifestyle/General
        logo: "⚽"
      },
      {
        name: "Trace Sports Stars",
        url: "https://trace-sportstars-samsungnz.amagi.tv/playlist.m3u8",
        category: "Sports", // Lifestyle/General
        logo: "⚽"
      },
      {
        name: "Turf Movil ",
        url: "https://tvturf4.janus.cl/playlist/stream.m3u8?d=w&id=",
        category: "Horse Racing", // Changed
        logo: "⚽"
      },
      {
        name: "UD Las Palmas TV  [Not 24/7]",
        url: "https://cdn318.fractalmedia.es/live319/hls/cudtv/high/index.m3u8",
        category: "Football", // Changed (Club Channel)
        logo: "⚽"
      },
      {
        name: "Unbeaten ",
        url: "https://unbeaten-tcl.amagi.tv/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "V Sport Vinter ",
        url: "http://62.210.211.188:2095/play/a00q",
        category: "Sports", // Winter Sports - niche
        logo: "⚽"
      },
      {
        name: "Vinx TV ",
        url: "https://tv.radiocast.es:5443/vinxtv/streams/vinxtvlive.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "W14DK-D 14.5 All Sports Television Network",
        url: "https://2-fss-2.streamhoster.com/pl_118/204972-2205186-1/playlist.m3u8",
        category: "Sports", // General
        logo: "⚽"
      },
      {
        name: "World Poker Tour",
        url: "https://world-poker-tour-samsung-ca.samsung.wurl.tv/playlist.m3u8",
        category: "Poker", // Changed
        logo: "⚽"
      },
      {
        name: "World of Freesports ",
        url: "https://mainstreammedia-worldoffreesportsintl-rakuten.amagi.tv/hls/amagi_hls_data_rakutenAA-mainstreammediafreesportsintl-rakuten/CDN/master.m3u8",
        category: "Sports", // General Action/Extreme
        logo: "⚽"
      },
      {
        name: "Zoy TV Sports 1",
        url: "https://fl1004.bozztv.com/ssh101/zoytvsports/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Zoy TV Sports 2",
        url: "https://fl1004.bozztv.com/ssh101/zoytvsports2/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Zoy TV Sports 3",
        url: "https://fl1004.bozztv.com/ssh101/zoytvsports3/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Zoy TV Sports 4",
        url: "https://fl1004.bozztv.com/ssh101/zoytvsports4/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "Zoy TV Sports 5",
        url: "https://fl1004.bozztv.com/ssh101/zoytvsports5/index.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "beIN Sports Haber",
        url: "https://canlitvulusal3.xyz/live/beinsportshaber/index.m3u8",
        category: "Sports", // General Network (News Focus)
        logo: "⚽"
      },
      {
        name: "beIN SPORTS XTRA",
        url: "http://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5df975e2b27cf5000921c102/master.m3u8?appName=web&appVersion=unknown&clientTime=0&deviceDNT=0&deviceId=6c26f5a4-30d3-11ef-9cf5-e9ddff8ff496&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&serverSideAds=false&sid=cb932046-e001-4189-a871-1376aa2ec340",
        category: "Sports", // General Network
        logo: "⚽"
      },
      {
        name: "viju+ Sport",
        url: "http://stream1.cinerama.uz/1229/tracks-v1a1/mono.m3u8",
        category: "Sports", // General Network
        logo: "⚽"
      }
  ]);*/

  const [iptvChannels, setIptvChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(null);
  // const [iptvChannels, setIptvChannels] = useState([
  //   {
  //     name: "Glory Kickboxing ",
  //     url: "https://6f972d29.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0dsb3J5S2lja2JveGluZ19ITFM/playlist.m3u8",
  //     category: "Combat Sports", // Changed
  //     logo: "⚽"
  //   }
  // ]);
  
  const [currentLayout, setCurrentLayout] = useState('grid');
  
  const [showLayoutOptions, setShowLayoutOptions] = useState(false);
  const [showStreamsMenu, setShowStreamsMenu] = useState(false);
  
  const [expandedVideoIdentifier, setExpandedVideoIdentifier] = useState(null); // Stores index or 'iptv'
  const [activeAudioIdentifier, setActiveAudioIdentifier] = useState(null); // Stores index or 'iptv'
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [newStreamName, setNewStreamName] = useState('');

  // --- Refs ---
  const videoRefs = useRef([]); // Refs for the regular stream video elements
  const hlsRefs = useRef([]);   // Refs for the HLS instances of regular streams
  const iptvPlayerContainerRef = useRef(null); // Ref for the container div of IPTVPlayer

  // --- Effects ---

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize/Cleanup Regular Streams
  useEffect(() => {
    // --- This effect remains the same ---
    console.log("Initializing/Updating regular streams effect");
    streams.forEach((stream, index) => {
      const videoElement = videoRefs.current[index];
      if (!videoElement) {
        console.warn(`No video ref found for regular stream index ${index}`);
        return;
      }
      if (hlsRefs.current[index]) {
        console.log(`Destroying old HLS for regular stream ${index}`);
        hlsRefs.current[index].destroy();
        hlsRefs.current[index] = null;
      }
      if (videoElement.src && !Hls.isSupported() && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          videoElement.removeAttribute('src');
          videoElement.load();
      }
      if (Hls.isSupported() && stream.url) {
         console.log(`Initializing HLS for regular stream ${index}: ${stream.name}`);
        const hls = new Hls({ maxBufferLength: 15, maxMaxBufferLength: 30 });
        hls.loadSource(stream.url);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
           if (videoElement.paused) {
               videoElement.play().catch(e => console.warn(`Autoplay prevented for regular stream ${index}:`, e));
           }
        });
         hls.on(Hls.Events.ERROR, (event, data) => {
            console.error(`HLS Error (Regular Stream ${index} - ${stream.name}):`, data);
         });
        hlsRefs.current[index] = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl') && stream.url) {
         console.log(`Using native HLS for regular stream ${index}: ${stream.name}`);
        videoElement.src = stream.url;
         if (videoElement.paused) {
             videoElement.play().catch(e => console.warn(`Autoplay prevented for native regular stream ${index}:`, e));
         }
      } else {
        console.warn(`HLS not supported or no URL for stream ${index}`);
      }
    });
    return () => {
      console.log("Cleaning up ALL regular stream HLS instances on streams change/unmount");
      hlsRefs.current.forEach(hls => {
        if (hls) hls.destroy();
      });
      hlsRefs.current = [];
    };
  }, [streams]);

  // Mute/Unmute based on activeAudioIdentifier
  useEffect(() => {
    videoRefs.current.forEach((videoElement, index) => {
      if (videoElement) {
        videoElement.muted = (activeAudioIdentifier !== index);
      }
    });
  }, [activeAudioIdentifier, streams]);

  // Handle fullscreen change
   useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setExpandedVideoIdentifier(null);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fetch channels when component mounts
  useEffect(() => {
    const loadChannels = async () => {
      setIsLoading(true); // Ensure loading is true when fetch starts
      setErrorLoading(null); // Clear previous errors
      try {
        const channels = await fetchAllChannels();
        console.log("Fetched channels:", channels.length);
        // Ensure you're setting an array, even if the fetch returns nothing
        setIptvChannels(Array.isArray(channels) ? channels : []);
      } catch (error) {
        console.error("Failed to fetch channels:", error);
        setErrorLoading("Failed to load channels. Please try again later."); // Set error message
        setIptvChannels([]); // Set empty array on error
      } finally {
        setIsLoading(false); // <-- Set loading to false when fetch completes (success or error)
      }
    };

    loadChannels();
  }, []); // Empty dependency array: runs once on mount
  
  // --- Handlers ---
  
  const handleToggleLayoutOptions = () => {
    setShowLayoutOptions(prev => !prev);
  };
  const handleToggleStreamsMenu = () => {
    setShowStreamsMenu(prev => !prev);
  };
  const handleMuteAll = () => {
    setActiveAudioIdentifier(null); // Setting active to null effectively mutes all
  };

  const handleToggleAudio = (identifier) => {
    setActiveAudioIdentifier(prev => (prev === identifier ? null : identifier));
  };

  const handleToggleExpand = (identifier) => {
    const getElementToFullscreen = (id) => {
      if (id === 'iptv') return iptvPlayerContainerRef.current;
      const videoEl = videoRefs.current[id];
      return videoEl?.closest('.video-container');
  }
  if (document.fullscreenElement) {
    document.exitFullscreen().then(() => setExpandedVideoIdentifier(null)).catch(console.error);
  } else {
    const element = getElementToFullscreen(identifier);
    if (element) {
      element.requestFullscreen({ navigationUI: "hide" })
        .then(() => setExpandedVideoIdentifier(identifier))
        .catch(err => console.error(`Fullscreen request failed for ${identifier}:`, err));
    } else {
       console.warn(`Could not find container element for identifier: ${identifier}`);
    }
  }
};

  const changeLayout = (layout) => {
    setCurrentLayout(layout);
    setShowLayoutOptions(false);
  };

  const addStream = () => {
    if (newStreamUrl && newStreamName) {
      try {
        new URL(newStreamUrl);
        const newStream = { url: newStreamUrl.trim(), name: newStreamName.trim() };
        setStreams(prevStreams => [...prevStreams, newStream]);
        setNewStreamUrl('');
        setNewStreamName('');
        setShowStreamsMenu(false);
      } catch (error) {
        alert("Please enter a valid URL.");
      }
    } else {
      alert("Please enter both a URL and a name.");
    }
  };

  const deleteStream = (indexToDelete) => {
    setStreams(prevStreams => prevStreams.filter((_, index) => index !== indexToDelete));
    if (activeAudioIdentifier === indexToDelete) setActiveAudioIdentifier(null);
    if (expandedVideoIdentifier === indexToDelete) setExpandedVideoIdentifier(null);
     // Adjust refs
     videoRefs.current.splice(indexToDelete, 1);
     hlsRefs.current.splice(indexToDelete, 1);
  };

  const getGridLayoutClass = () => {
    switch (currentLayout) {
      case 'grid': return 'grid-layout';
      case 'three-by-three': return 'three-by-three-layout';
      case 'triple-main': return 'triple-main-layout';
      case 'side-by-side': return 'side-by-side-layout';
      case 'quad-stack': return 'quad-stack-layout';
      default: return 'grid-layout';
    }
  };

  // --- JSX ---
  return (

    <div className="app-container">
      <Navbar/>
      {/* <ChannelList/> */}

      <div className="mosaic-container">
        <div id="videoGrid" className={`mosaic ${getGridLayoutClass()}`}>
          {/* Render Regular Streams */}
          
          {/* {streams.map((stream, index) => {
            const isExpanded = expandedVideoIdentifier === index;
            const hasAudio = activeAudioIdentifier === index;
            const audioButtonIcon = hasAudio ? "🔇" : "🔊";
            const audioButtonTitle = hasAudio ? "Mute" : "Unmute";
            const expandButtonIcon = isExpanded ? "🇽" : "⤢";

            
            return (

                <HLSStream
                  key={`stream-${stream.url}-${index}`} // Use a stable key
                  stream={stream}
                  identifier={index} // Pass the index as identifier
                  isExpanded={expandedVideoIdentifier === index}
                  hasAudio={activeAudioIdentifier === index}
                  onToggleAudio={handleToggleAudio}   // Pass the handler from App
                  onToggleExpand={handleToggleExpand} // Pass the handler from App
                />
            );
          })} */}

          {/* <Container>
            <SelectionScreen>
            </SelectionScreen>
          </Container> */}

          {/* <Container>
            <Iframe src="https://www.iptvcat.com/" 
                    title="IPTV Cat"
                    width="100%"
                    height="100%">
            </Iframe>
          </Container> */}

          <Container>
            <div className="embed-container">
              <TVGarden
              src="https://tv.garden/"/>
            </div>
          </Container>

          {/* <Container>
            <Iframe src="https://thetvapp.to/" 
                    title="The TV App"
                    width="100%"
                    height="100%"> 
            </Iframe>
          </Container> */}

          {/* IPTV Player Container & Component */}
          {isLoading ? (
            <div className="loading-message">Loading IPTV channels...</div>
          ) : errorLoading ? (
            <div className="error-message">{errorLoading}</div>
          ) : iptvChannels.length === 0 ? (
            <div className="no-channels-message">No IPTV channels available.</div>
          ) : null}
          {/* IPTV Player */}

          <div ref={iptvPlayerContainerRef} className="video-container-wrapper"> {/* Added wrapper for ref */}
            <IPTVPlayer   
                channels={iptvChannels}
                isExpanded={expandedVideoIdentifier === 'iptv'}
                hasAudio={activeAudioIdentifier === 'iptv'}
                onToggleAudio={handleToggleAudio}
                onToggleExpand={handleToggleExpand}
             />
          </div>
          

          <Player 
            url="https://www.youtube.com/watch?v=fO9e9jnhYK8" //url="https://www.youtube.com/watch?v=fO9e9jnhYK8"
            className="stream-video" // Reuse your CSS class
          />

          <Container>
            <TVNZ/>
          </Container>
        
        </div>
      </div>

      {/* Pop-up Menus */}
       <div className={`layout-options ${showLayoutOptions ? 'show' : ''}`}>
         <div className="layout-option" onClick={() => changeLayout('grid')}>2x2 Grid</div>
         <div className="layout-option" onClick={() => changeLayout('three-by-three')}>3x3 Grid</div>
         <div className="layout-option" onClick={() => changeLayout('triple-main')}>Main + 3</div>
         <div className="layout-option" onClick={() => changeLayout('side-by-side')}>Side by Side</div>
         <div className="layout-option" onClick={() => changeLayout('quad-stack')}>4 Stack</div>
      </div>

      <div className={`streams-menu ${showStreamsMenu ? 'show' : ''}`}>
        <h3>Manage Streams</h3>
        <div id="streamsList">
          {streams.map((stream, index) => (
            <div key={`stream-item-${stream.url}-${index}`} className="stream-item">
              <span>{stream.name}</span>
              <button className="control-btn delete-btn" onClick={() => deleteStream(index)} title="Delete Stream">
                🗑️
              </button>
            </div>
          ))}
           {streams.length === 0 && <p>No custom streams added.</p>}
        </div>
        <div className="add-stream-form">
          <h4>Add New Stream</h4>
          <input type="text" id="streamUrl" placeholder="Enter HLS stream URL (.m3u8)" value={newStreamUrl} onChange={(e) => setNewStreamUrl(e.target.value)} />
          <input type="text" id="streamName" placeholder="Stream Name" value={newStreamName} onChange={(e) => setNewStreamName(e.target.value)} />
          {/* <input type="text" id="streamName" placeholder="Stream Name" value={newStreamName} onChange={(e) => setNewStreamName(e.target.value)} /> */}
          <button id="addStreamBtn" onClick={addStream}> Add Stream </button>
        </div>
      </div>

      {/* <Footer/> */}
      <Footer
        isLayoutOptionsOpen={showLayoutOptions}
        onToggleLayoutOptions={handleToggleLayoutOptions}
        isStreamsMenuOpen={showStreamsMenu}
        onToggleStreamsMenu={handleToggleStreamsMenu}
        onMuteAll={handleMuteAll}
      />
      
    </div>
  );
}

export default App;