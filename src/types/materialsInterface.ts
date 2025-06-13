export interface density {
    density: number;
}

export interface elasticity {
    youngs_modulus: number;
    poissons_ratio: number;
    shear_modulus?: number;
    bulk_modulus?: number;
}

export interface fractureToughness {
    fracture_toughness: number;
    critical_stress_intensity_factor?: number;
}

export interface hardness {
    mohs_hardness?: number;
    vickers_hardness?: number;
}

export interface plasticity {
    yield_strength: number;
    hardening_coefficient?: number;
    plastic_strain?: number;
}

export interface stressStrain {
    yieldStrength: number;
    ultimate_tensile_strength: number;
    elastic_limit: number;
    strain_hardening_exponent: number;
}

export interface thermalProperties {
    thermal_conductivity: number;
    specific_heat_capacity: number;
    thermal_expansion_coefficient?: number;
}

export interface viscosity {
    dynamic_viscocity: number;
    kinematic_viscosity?: number;
}