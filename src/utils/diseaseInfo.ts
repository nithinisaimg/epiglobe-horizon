// Cure / treatment and outlook per disease.
export interface DiseaseInfo {
  cure: string;
  prediction: string;
}

export const DISEASE_INFO: Record<string, DiseaseInfo> = {
  covid19: {
    cure: 'No universal cure. Antivirals (Paxlovid, remdesivir), monoclonal antibodies, and supportive oxygen therapy. mRNA and protein-subunit vaccines (Pfizer, Moderna, Novavax) reduce severe disease.',
    prediction: 'Transitioning to endemic seasonal pattern. Expect winter waves driven by new Omicron sub-variants; severity continues to decline with population immunity.',
  },
  influenza: {
    cure: 'Antivirals: oseltamivir (Tamiflu), baloxavir. Annual quadrivalent vaccine is primary prevention. Most cases resolve with rest, fluids, and fever management.',
    prediction: 'Annual seasonal cycles will continue. Risk of a novel pandemic strain (e.g. H5N1 spillover) remains moderate; surveillance and stockpiled vaccines reduce impact.',
  },
  mpox: {
    cure: 'Tecovirimat (TPOXX) antiviral for severe cases. JYNNEOS vaccine (2 doses) gives strong protection. Supportive care for lesions; most cases resolve in 2-4 weeks.',
    prediction: 'Sporadic outbreaks expected to continue in non-endemic regions. Clade I (more severe) spread in Central Africa is the main concern for 2025-26.',
  },
  dengue: {
    cure: 'No specific antiviral. Supportive care with fluids and paracetamol (avoid NSAIDs). Qdenga and Dengvaxia vaccines available for seropositive individuals in endemic areas.',
    prediction: 'Cases projected to rise sharply with climate change expanding Aedes mosquito range. Expected doubling of at-risk population by 2050.',
  },
  malaria: {
    cure: 'Artemisinin-based combination therapy (ACT) is first-line treatment. RTS,S and R21 vaccines now deployed in sub-Saharan Africa. Bed nets and indoor spraying remain critical.',
    prediction: 'Slow decline possible with vaccine rollout, but drug-resistant P. falciparum and insecticide resistance threaten progress. Eradication unlikely before 2050.',
  },
  ebola: {
    cure: 'Inmazeb and Ebanga monoclonal antibodies approved for Zaire strain. Ervebo vaccine used in ring vaccination. Early IV fluids dramatically improve survival.',
    prediction: 'Sporadic Central/West African outbreaks will continue due to animal reservoirs (fruit bats). Fast-response vaccination keeps outbreaks small.',
  },
  sars: {
    cure: 'No outbreak since 2004. Was contained via isolation and contact tracing; supportive care only. No licensed vaccine or specific antiviral.',
    prediction: 'Re-emergence risk is low but non-zero. Any new coronavirus spillover would likely follow SARS-CoV-2 mRNA platform response.',
  },
  h1n1: {
    cure: 'Oseltamivir and zanamivir are effective. H1N1 pdm09 is now included in annual seasonal flu vaccines. Became a regular seasonal strain after 2010.',
    prediction: 'Now endemic as seasonal flu. No pandemic-level resurgence expected from this specific strain.',
  },
  spanish_flu: {
    cure: 'Historical — no antivirals or vaccines existed. Modern equivalents would use neuraminidase inhibitors and prepandemic H1N1 vaccines.',
    prediction: 'Strain is extinct as a distinct entity. Modern descendants circulate as seasonal H1N1; pandemic flu risk persists but response capacity is vastly improved.',
  },
  plague: {
    cure: 'Modern antibiotics: streptomycin, gentamicin, doxycycline — cure >90% if treated within 24h. Rodent/flea control prevents spread.',
    prediction: 'Small endemic foci persist (Madagascar, western USA, Mongolia). Global pandemic risk is minimal with modern sanitation and antibiotics.',
  },
  smallpox: {
    cure: 'Eradicated globally in 1980. Tecovirimat and brincidofovir exist as countermeasures. ACAM2000 and JYNNEOS vaccines stockpiled against bioterror release.',
    prediction: 'No natural circulation. Only risk is accidental lab release or bioterrorism; global ring-vaccination plan is in place.',
  },
};

export function getDiseaseInfo(id: string): DiseaseInfo {
  return DISEASE_INFO[id] ?? { cure: 'Information unavailable.', prediction: 'Information unavailable.' };
}