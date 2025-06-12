interface density {
    density: number;
}

interface elasticity {
    youngs_modulus: number;
    poissons_ratio: number;
    shear_modulus?: number;
    bulk_modulus?: number;
}

interface fractureToughness {
    fracture_toughness: number;
    critical_stress_intensity_factor?: number;
}

interface hardness {
    mohs_hardness?: number;
    vickers_hardness?: number;
}

interface plasticity {
    yield_strength: number;
    hardening_coefficient?: number;
    plastic_strain?: number;
}

interface stressStrain {
    yieldStrength: number;
    ultimate_tensile_strength: number;
    elastic_limit: number;
    strain_hardening_exponent: number;
}

interface thermalProperties {
    thermal_conductivity: number;
    specific_heat_capacity: number;
    thermal_expansion_coefficient?: number;
}

interface viscosity {
    dynamic_viscocity: number;
    kinematic_viscosity?: number;
}