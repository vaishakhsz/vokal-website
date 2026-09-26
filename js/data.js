/**
 * VOKAL - Voice of Kerala for Animal Legit (vokal.org.in)
 * Updated Official Seed Data with Local Authentic Master Images
 */

const VOKAL_DEFAULT_DATA = {
  organization: {
    name: "VOKAL",
    fullName: "Voice of Kerala for Animal Legit",
    tagline: "Voice of Kerala for Animal Legit • Justice For All Creatures",
    domain: "vokal.org.in",
    email: "voiceofkerala.legit@gmail.com",
    address: "Building No .21/546, Mankayi Kavala, Udayamperoor Grama Panchayat, Udayamperoor, Kerala, India - 682 307",
    legalRegistration: "Reg. No: 147/2026",
    logoEmblem: "assets/vokal_logo_emblem.png",
    headerTitle: "assets/vokal_header_title.png",
    fullLetterhead: "assets/vokal_letterhead.png",
    stats: {
      rescues: "4,850+",
      legalPetitions: "128",
      vaccinations: "14,200+",
      districtsCovered: "14"
    }
  },

  visionMission: {
    vision: "To establish a Kerala where every animal is recognized with inherent dignity, legal legitimacy, and constitutional protection under Article 51A(g), creating a compassionate society where humans and animals coexist harmoniously without cruelty, culling, or neglect.",
    mission: [
      {
        icon: "bi-shield-check",
        title: "Constitutional & Legal Enforcement",
        desc: "Upholding Article 51A(g) of the Indian Constitution, enforcing the Prevention of Cruelty to Animals Act 1960, and moving High Court and Supreme Court representations for animal rights."
      },
      {
        icon: "bi-heart-pulse-fill",
        title: "Scientific & Humane ABC/ARV",
        desc: "Advocating strict adherence to Animal Birth Control (ABC) Rules 2023, high-standard mass anti-rabies vaccination drives, and humane population stabilization."
      },
      {
        icon: "bi-person-heart",
        title: "Feeder Protection & Community Coexistence",
        desc: "Protecting community animal caretakers against harassment and designating hygienic feeding zones in all 14 districts in accordance with High Court rulings."
      },
      {
        icon: "bi-mortarboard-fill",
        title: "Education, Empathy & Youth Mobilization",
        desc: "Conducting humane education workshops in Kerala schools, colleges, resident associations, and training police personnel on animal protection laws."
      }
    ]
  },

  // 6 SPIRITUAL MASTERS (AMMA FIRST AS REQUESTED):
  // 1. Mata Amritanandamayi Devi (Amma)
  // 2. Gautama Buddha
  // 3. Bhagwan Mahavira (Jainism)
  // 4. Guru Nanak Dev Ji (Sikhism)
  // 5. Jesus Christ
  // 6. Prophet Muhammad
  spiritualMasters: [
    {
      id: "master-amritanandamayi",
      name: "Mata Amritanandamayi Devi (Amma)",
      title: "Universal Mother of Compassion & Reverence for Nature",
      image: "assets/masters/amma_1.jpg",
      portrait: "assets/masters/amma_1.jpg",
      images: [
        "assets/masters/amma_1.jpg",
        "assets/masters/amma_3.jpg",
        "assets/masters/amma_4.jpg"
      ],
      photoIntervalSeconds: 10,
      totalDurationSeconds: 40,
      quote: "Nature is our mother. In truth, there is no difference between human beings and animals; the same divine life force pulses through every creature. Just as we feel pain, animals also feel hunger, fear, and distress. When we protect and feed a helpless animal, we are serving the Divine.",
      tradition: "Sanatana Dharma & Universal Prema (Amritapuri, Kerala)",
      teaching: "Amma teaches that true spiritual maturity begins when our circle of love expands to embrace every voiceless creature. Animals are not commodities for exploitation; they are our silent kin sharing the same cosmic breath. Feeding the hungry stray and caring for wounded animals is direct worship of the Almighty."
    },
    {
      id: "master-buddha",
      name: "Gautama Buddha",
      title: "The Awakened Teacher of Boundless Karuna & Universal Harmlessness",
      image: "assets/masters/gautama_buddha.jpg",
      portrait: "assets/masters/gautama_buddha.jpg",
      quote: "Just as a mother protects her only child with her life, even so let one cultivate a boundless love towards all beings in the entire universe. All beings tremble at violence; all fear death. Putting oneself in the place of another, one should neither kill nor cause to kill.",
      tradition: "Buddhism / Karuna (Compassion) & Ahimsa",
      teaching: "Lord Buddha placed universal harmlessness and loving-kindness (Metta) at the very core of enlightened life. He taught that causing suffering to animals creates heavy karmic bondage, while protecting, feeding, and respecting sentient creatures purifies the mind and leads to liberation."
    },
    {
      id: "master-mahavira",
      name: "Bhagwan Mahavira",
      title: "24th Tirthankara & Pioneer of Ahimsa Paramo Dharma (Universal Non-Violence)",
      image: "assets/masters/bhagwan_mahavira.jpg?v=2.0",
      portrait: "assets/masters/bhagwan_mahavira.jpg?v=2.0",
      quote: "“Ahimsa Paramo Dharma — Non-injury is the highest religion. All beings are fond of life, like pleasure, hate pain, shun destruction, and desire to live. Putting oneself in the place of another, one should neither kill nor cause to kill.” — Acharanga Sutra (1.4.1)",
      tradition: "Jainism / Supreme Ahimsa & Jiva-Daya (Reverence for Sentient Life)",
      teaching: "Bhagwan Mahavira established absolute non-violence (Ahimsa) and compassion for all living souls (Jiva-Daya) as the supreme spiritual path. Jain philosophy teaches that every living creature—from the smallest being to street animals and birds—possesses an immortal consciousness (Jiva) desiring happiness and fearing suffering. Causing harm, cruelty, or distress to any voiceless creature incurs grave spiritual harm. For millennia, the Jain tradition has pioneered panjrapoles (animal shelters), bird feeders, and active daily welfare for abandoned and sick animals."
    },
    {
      id: "master-nanak",
      name: "Guru Nanak Dev Ji",
      title: "First Sikh Guru & Beacon of Universal Compassion (Daya) & Divine Oneness",
      image: "assets/masters/guru_nanak.jpg?v=2.0",
      portrait: "assets/masters/guru_nanak.jpg?v=2.0",
      quote: "“Dukh na dei kisai jia pat sio ghar javo — Do not cause suffering to any living being; return to your true home with honor.” — Guru Granth Sahib (Ang 322)",
      tradition: "Sikhism / Sarbat Da Bhala (Well-Being of All) & Daya (Compassion)",
      teaching: "Guru Nanak Dev Ji and the Sikh Gurus taught that the Divine Light (Jot) permeates every creature across creation. True righteousness is born entirely out of compassion (<em>'Dhaul dharamu daya ka pootu'</em> — Japji Sahib). Because the Creator dwells within all beings, tormenting, abusing, or causing distress to any defenseless animal is an affront to the Divine. Sikh tradition champions <em>Sarbat Da Bhala</em> (welfare of all creation) and mandates active protection, feeding, and tender mercy toward all sentient life."
    },
    {
      id: "master-jesus",
      name: "Jesus Christ",
      title: "The Good Shepherd & Guardian of Innocent Life",
      image: "assets/masters/jesus_christ.jpg",
      portrait: "assets/masters/jesus_christ.jpg",
      quote: "Are not five sparrows sold for two pennies? Yet not one of them is forgotten in God's sight. The righteous care for the needs of their animals, but the kindest acts of the wicked are cruel. Blessed are the merciful, for they shall receive mercy.",
      tradition: "Christianity / Divine Mercy & Faithful Stewardship",
      teaching: "Jesus Christ revealed that the Almighty watches tenderly over even the smallest, most defenseless bird. True spiritual discipleship demands mercy and gentle stewardship over creation. To neglect, torture, or abandon voiceless animals contradicts the unconditional love of God."
    },
    {
      id: "master-muhammad",
      name: "Prophet Muhammad",
      title: "Mercy to All Creation (Rahmatan lil-Alamin) • Authentic Hadith Traditions",
      image: "assets/masters/prophet_muhammad.jpg",
      portrait: "assets/masters/prophet_muhammad.jpg",
      quote: "“There is a reward for serving any living being.” — Prophet Muhammad (Sahih al-Bukhari 2363, 6009 & Sahih Muslim 2244)",
      tradition: "Islam / Rahmah (Universal Mercy) & Verified Sunnah",
      teaching: `<p class="mb-0"><strong><i class="bi bi-book-half me-1" style="color: #ff4081;"></i> Sahih al-Bukhari & Sahih Muslim:</strong><br>That beautiful principle comes directly from the Hadith, which are the verified records of the sayings and actions of the Prophet Muhammad. While the Quran contains general commands to be merciful, the specific teaching that feeding or giving water to a stray dog counts as a rewarded act of charity (Sadaqah) is documented in the most trusted Hadith collections: In <em>Sahih al-Bukhari</em> (Hadith 2363 & 6009) and <em>Sahih Muslim</em> (Hadith 2244), the Prophet narrated the story of the man who climbed down a well to fetch water in his shoe for a panting dog, establishing the universal rule: <strong>"There is a reward for serving any living being."</strong> Another authentic narration records that a woman whose past sins were entirely forgiven by Allah simply because she used her shoe to draw water from a well for a dog that was circling it out of extreme thirst (<em>Sahih al-Bukhari</em> 3467).</p>`
    }
  ],

  events: [
    {
      id: "evt-01",
      title: "Mega Anti-Rabies Vaccination & Glow Collar Drive",
      category: "Vaccination & Care",
      date: "August 28, 2026",
      location: "Ernakulam North & Marine Drive, Kochi",
      description: "Vaccinated over 320 community dogs and fitted reflective safety collars to prevent nighttime vehicular road accidents. Conducted with certified volunteer veterinarians.",
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "evt-02",
      title: "Statewide Animal Law Awareness Workshop for Law Enforcers",
      category: "Legal & Advocacy",
      date: "July 19, 2026",
      location: "Police Training College, Thiruvananthapuram",
      description: "Comprehensive 1-day symposium for 75 Kerala Police Sub-Inspectors and LSGD officials regarding FIR filing under PCA Act 1960, IPC 428/429, and High Court guidelines.",
      image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "evt-03",
      title: "Rescue & Emergency Medical Aid for Hit-and-Run Victims",
      category: "Emergency Rescue",
      date: "June 25, 2026",
      location: "Kozhikode Bypass & Feroke",
      description: "Critical surgical intervention and foster rehabilitation for 18 stray dogs and cats struck by heavy vehicles along National Highway 66.",
      image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "evt-04",
      title: "Community Feeder ID Issuance & Legal Protection Camp",
      category: "Community Support",
      date: "May 12, 2026",
      location: "Alappuzha Town Hall",
      description: "Empowered 140 daily street animal feeders with certified VOKAL Caretaker ID cards, copies of High Court protective orders, and 2,000 kg of dog and cat food packets.",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "evt-05",
      title: "Human Chain & Peaceful Candlelight March for Animal Rights",
      category: "Public Campaign",
      date: "April 05, 2026",
      location: "Manaveeyam Veedhi, Thiruvananthapuram",
      description: "Over 800 citizens, students, and advocates gathered to condemn illegal poisoning and demand state budget allocation for modern ABC clinics in every Taluk.",
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "evt-06",
      title: "Classroom Compassion: Humane Education in Schools",
      category: "Humane Education",
      date: "March 15, 2026",
      location: "Kottayam Model High School & CMS College",
      description: "Interactive session educating 600+ students on understanding canine body language, bite prevention, first-aid, and the moral duty to protect vulnerable beings.",
      image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1000&q=80"
    }
  ],

  videos: [
    {
      id: "vid-01",
      title: "Why Mass Culling Fails: The Science of Animal Birth Control (ABC)",
      category: "Scientific Policy",
      duration: "14:20",
      thumbnail: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.youtube.com/embed/gXgS_c30e7U",
      description: "Detailed video breakdown by veterinary epidemiologists explaining why culling causes the vacuum effect and why ABC/ARV is the only mathematically proven method for safe streets."
    },
    {
      id: "vid-02",
      title: "Kerala High Court Directives on Animal Protection & Feeder Rights",
      category: "Legal Insights",
      duration: "21:45",
      thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.youtube.com/embed/HndV87XpkWg",
      description: "Senior advocates analyze the landmark orders of the High Court of Kerala regarding Article 51A(g) and the protection of citizens who feed community animals."
    },
    {
      id: "vid-03",
      title: "Mata Amritanandamayi (Amma) on Divine Compassion to Mother Nature & Animals",
      category: "Spiritual Wisdom",
      duration: "09:30",
      thumbnail: "assets/masters/mata_amritanandamayi.jpg",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "Excerpts of Amma's discourses highlighting empathy towards street animals, birds, and preserving ecological balance across Kerala and the world."
    },
    {
      id: "vid-04",
      title: "Inside a VOKAL 24/7 Mobile Veterinary Rescue Mission in Kerala",
      category: "Rescue Stories",
      duration: "11:15",
      thumbnail: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.youtube.com/embed/gXgS_c30e7U",
      description: "Follow the VOKAL emergency rescue van answering distress calls across Ernakulam district, saving abandoned pets and treating injured street dogs."
    }
  ],

  lettersToGovt: [
    {
      id: "let-01",
      refNo: "VOKAL/CMO/2026/089",
      recipient: "Hon'ble Chief Minister of Kerala",
      department: "Chief Minister's Office (CMO)",
      subject: "Urgent Representation for Full Implementation of Animal Birth Control Rules 2023 and Ending Vigilante Cruelty",
      date: "August 14, 2026",
      status: "Action Taken",
      statusColor: "success",
      docUrl: "assets/letters/letter-cmo-2026-089.txt",
      summary: "Comprehensive memorandum requesting the state government to allocate dedicated funds for taluk-level ABC clinics with CCTV surveillance, accredited surgeons, and strict penal action against individuals instigating illegal dog killings.",
      keyDemands: [
        "Immediate notification of designated ABC monitoring committees in all 14 districts",
        "Mandatory 24x7 government veterinary casualty units in major corporations",
        "Strict criminal prosecution of vigilante groups under PCA Act Sec 11 & IPC 429"
      ]
    },
    {
      id: "let-02",
      refNo: "VOKAL/DGP/2026/044",
      recipient: "Director General of Police & State Police Chief",
      department: "Kerala Police Headquarters",
      subject: "SOP for Compulsory FIR Registration on Animal Cruelty Incidents without Delay or Refusal",
      date: "July 22, 2026",
      status: "Under Review",
      statusColor: "warning",
      docUrl: "assets/letters/letter-dgp-2026-044.txt",
      summary: "Formal representation highlighting recurring instances of Station House Officers (SHOs) turning away animal cruelty complaints as non-cognizable. Urges issuance of an explicit Police Executive Directive for prompt registration of FIRs.",
      keyDemands: [
        "Issue mandatory circular to all 500+ Kerala police stations",
        "Appoint a designated Animal Welfare Nodal Officer at each District Police Office",
        "Introduce standard forensics protocol for animal poisoning post-mortems"
      ]
    },
    {
      id: "let-03",
      refNo: "VOKAL/LSGD/2026/031",
      recipient: "Minister & Principal Secretary, Local Self Government Dept",
      department: "LSGD Kerala",
      subject: "Demarcation of Designated Feeding Zones and Issuance of Official Feeder Identity Badges",
      date: "June 10, 2026",
      status: "Implemented",
      statusColor: "primary",
      docUrl: "assets/letters/letter-lsgd-2026-031.txt",
      summary: "In accordance with Supreme Court and Kerala High Court rulings, requested LSGD to instruct municipal corporations (Kochi, TVM, Kozhikode, Thrissur, Kollam, Kannur) to demarcate clean feeding spaces and protect peaceful feeders from neighbour harassment.",
      keyDemands: [
        "Official LSGD circular guaranteeing feeder protection",
        "Setup of clean water bowls and shaded feeding corners in municipal parks",
        "Public awareness hoardings declaring harassment of animal feeders as illegal"
      ]
    },
    {
      id: "let-04",
      refNo: "VOKAL/AH/2026/015",
      recipient: "Director, Animal Husbandry Department",
      department: "Animal Husbandry Dept",
      subject: "Crackdown on Illegal Backyard Puppy Mills, Dog Fighting & Unlicensed Pet Shops",
      date: "May 04, 2026",
      status: "Hearing Scheduled",
      statusColor: "info",
      docUrl: "assets/letters/letter-ah-2026-015.txt",
      summary: "Submitted evidence dossiers documenting 43 unauthorized commercial breeding units operating in residential areas without State Animal Welfare Board registration, subjecting pedigree breeds to torturous confinement.",
      keyDemands: [
        "Statewide joint raids by Animal Husbandry, Police, and Revenue officials",
        "Confiscation of animals kept in cruel conditions and revocation of trade licenses",
        "Public online registry of legal, AWBI-certified breeders in Kerala"
      ]
    }
  ]
};

window.VOKAL_DEFAULT_DATA = VOKAL_DEFAULT_DATA;
