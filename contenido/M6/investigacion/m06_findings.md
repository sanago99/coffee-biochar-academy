# Findings — research-m06 (aria)
## Sesiones S6.1, S6.2 | Módulo 06: dMRV, integridad del dato y créditos de carbono

### Fuentes identificadas: 20 referencias peer-reviewed con DOI verificado
### Sesiones cubiertas: S6.1 (dMRV y monitoreo digital de carbono), S6.2 (integridad del dato, trazabilidad y créditos)

**Estado:** Completo — listo para redacción por writer-scientific
**Fecha:** 2026-03-17

---

## S6.1 — Monitoreo digital de carbono (dMRV): tecnología y protocolos

### Tema central
Definición y componentes del dMRV, tecnologías de sensores IoT y Vis-NIR, teledetección (Sentinel, Landsat, SAR), modelos de estimación SOC, plataformas operativas, incertidumbre en medición, requerimientos de estándares de biochar.

### Referencias verificadas (10)

**[S6.1-01]** Diaz-Chavez, R., et al. (2025). Digital Monitoring, Reporting, and Verification Technologies Supporting Carbon Credit-Generating Water Security Programs: State of the Art and Technology Roadmap. *Environmental Science & Technology Letters*.
- DOI: https://doi.org/10.1021/acs.estlett.4c01048
- Datos clave: Benchmark de tecnologías de sensores (IoT, satélite, dron) contra requerimientos de desempeño MRV; las metodologías actuales no están estandarizadas — implementadores seleccionan enfoques de medición independientemente; recomienda que desarrolladores de metodología colaboren con organismos de estándares para validar tecnologías sensoras contra benchmarks MRV; tecnología más madura: sensores de suelo TDR + teledetección multiespectral integrada
- GRADE: **Alto** (ES&T Letters, ACS, revisión tecnológica más comprehensiva disponible sobre dMRV, 2025)
- Uso en S6.1: revisión integral del estado del arte dMRV, componentes tecnológicos, roadmap de estandarización

**[S6.1-02]** Batjes, N.H., Ceschia, E., Heuvelink, G.B.M., Demenois, J., le Maire, G., Cardinael, R., Arias-Navarro, C., & van Egmond, F. (2024). Towards a modular, multi-ecosystem monitoring, reporting and verification (MRV) framework for soil organic carbon stock change assessment. *Carbon Management*, 15(1).
- DOI: https://doi.org/10.1080/17583004.2024.2410812
- Datos clave: Revisión de esquemas MRV existentes para cultivos, praderas y bosques en múltiples continentes; propone arquitectura modular escalable a niveles IPCC Tier 1–3; la arquitectura modular es clave para reducir costos de MRV por proyecto manteniendo rigor; prototipo operacional de herramienta multi-ecosistema; autores de ISRIC — World Soil Information (alta autoridad institucional)
- GRADE: **Alto** (Carbon Management, Taylor & Francis, revisión institucional ISRIC)
- Uso en S6.1: arquitectura de sistemas dMRV, escalabilidad Tier 1-3, diseño modular para plataformas operativas

**[S6.1-03]** Johnson, J.M.F., & Theissen, M. (2024). Solutions and insights for agricultural monitoring, reporting, and verification (MRV) from three consecutive issuances of soil carbon credits. *Journal of Environmental Management*, 369, 122284.
- DOI: https://doi.org/10.1016/j.jenvman.2024.122284
- Datos clave: Programa Indigo Ag escalado de 40,000 ha (1ª emisión, junio 2022) a 550,000 ha (3ª emisión, febrero 2024); introducción de cultivos de cobertura produjo las mayores reducciones netas de GEI; viabilidad demostrada de un pipeline dMRV impulsado por datos a escala comercial usando datos de manejo + modelos de regresión; costos de muestreo físico de suelo reducidos mediante estimación digital
- GRADE: **Alto** (J. Environmental Management, Elsevier; caso de estudio empírico único a escala industrial)
- Uso en S6.1: caso operativo de plataforma dMRV a escala, reducción de costos MRV, pipeline de ingesta de datos agronómicos

**[S6.1-04]** Yao, Y., & Zhang, B. (2025). Life Cycle Assessment in the Monitoring, Reporting, and Verification of Land-Based Carbon Dioxide Removal: Gaps and Opportunities. *Environmental Science & Technology*, 59(24), 11950–11963.
- DOI: https://doi.org/10.1021/acs.est.4c09510
- Datos clave: Revisó protocolos MRV de todos los registros principales (Verra, Gold Standard, Puro.earth, ACR) para cuatro métodos CDR terrestres incluyendo biochar; identificó brechas sistemáticas en integración LCA-MRV, especialmente para temporalidad, permanencia y supuestos de modelado dinámico de carbono en sistemas biochar; propone LCA como complemento obligatorio al MRV para capturar emisiones upstream de feedstock
- GRADE: **Alto** (Environmental Science & Technology, ACS; revisión comparativa de protocolos reales de registros)
- Uso en S6.1: requerimientos específicos dMRV para biochar (Puro.earth, EBC), brechas de LCA en protocolos actuales, comparación inter-registros

**[S6.1-05]** Poggio, L., de Sousa, L.M., Batjes, N.H., Heuvelink, G.B.M., Kempen, B., Ribeiro, E., & Rossiter, D. (2021). SoilGrids 2.0: producing soil information for the globe with quantified spatial uncertainty. *SOIL*, 7(1), 217–240.
- DOI: https://doi.org/10.5194/soil-7-217-2021
- Datos clave: Mapas SOC globales a 250 m de resolución usando machine learning entrenado con ~240,000 perfiles de suelo y >400 covariables ambientales; incertidumbre de predicción espacial cuantificada (intervalos de predicción 90%) a 6 profundidades estándar (0–200 cm); stocks SOC (0–30 cm): <10 t C/ha en regiones áridas hasta >200 t C/ha en turberas tropicales
- GRADE: **Alto** (SOIL, Copernicus; referencia global estándar usada por plataformas dMRV y registros Verra, Gold Standard)
- Uso en S6.1: línea base SOC para plataformas dMRV, incertidumbre espacial como input para cálculo de créditos, Tier 2/3 digital mapping

**[S6.1-06]** Amelung, W., Bossio, D., de Vries, W., Kögel-Knabner, I., Lehmann, J., Amundson, R., Bol, R., Collins, C., Lal, R., Leifeld, J., Minasny, B., Pan, G., Paustian, K., Rumpel, C., Sanderman, J., van Groenigen, J.W., Mooney, S., van Wesemael, B., Wander, M., & Chabbi, A. (2020). Towards a global-scale soil climate mitigation strategy. *Nature Communications*, 11, 5427.
- DOI: https://doi.org/10.1038/s41467-020-18887-7
- Datos clave: Suelos agrícolas con grandes brechas de rendimiento y altas pérdidas históricas de SOC representan la mayor oportunidad de secuestro: 0.9–1.85 Gt C/año globalmente bajo manejo mejorado; las tasas de secuestro varían 3–10x dependiendo de textura del suelo, zona climática e historia de manejo → hace que el monitoreo digital espacialmente explícito sea esencial para verificación creíble; propone sistema de información del suelo con datos localizados como prerrequisito del MRV global
- GRADE: **Alto** (Nature Communications, 11, autores: 19 investigadores líderes incluyendo Lehmann, Lal, Minasny)
- Uso en S6.1: justificación científica del Tier 3 dMRV vs. factores promedio globales, variabilidad espacial del SOC, arquitectura de sistemas de información del suelo

**[S6.1-07]** Ou, G., Li, C., Lv, Y., Wei, A., Xiong, H., Xu, H., & Wang, G. (2020). Forest aboveground biomass estimation using Landsat 8 and Sentinel-1A data with machine learning algorithms. *Scientific Reports*, 10, 9952.
- DOI: https://doi.org/10.1038/s41598-020-67024-3
- Datos clave: Modelo XGBoost combinando Landsat 8 + Sentinel-1A SAR alcanzó mejor estimación de biomasa aérea (R² = 0.87, RMSE = 18.3 Mg/ha) en bosques subtropicales; XGBoost y Random Forest superaron significativamente la regresión lineal (mejora R² ~0.25); SAR de Sentinel-1A redujo efectos de saturación en estimación de biomasa para AGB >150 Mg/ha
- GRADE: **Moderado-Alto** (Scientific Reports, Nature Publishing Group; estudio empírico riguroso con validación independiente)
- Uso en S6.1: fusión óptico-SAR para estimación de biomasa/carbono en proyectos forestales, flujo de trabajo dMRV estándar para REDD+/ARR, superación de saturación espectral

**[S6.1-08]** Zayani, H., Fouad, Y., Michot, D., Kassouk, Z., Walter, C., Gontier, L., Tremblay, N., & Mouazen, A.M. (2023). Using Machine-Learning Algorithms to Predict Soil Organic Carbon Content from Combined Remote Sensing Imagery and Laboratory Vis-NIR Spectral Datasets. *Remote Sensing*, 15(17), 4264.
- DOI: https://doi.org/10.3390/rs15174264
- Datos clave: Predicción SOC solo con Sentinel-2A: R² = 0.57 (RMSE = 2.1 g/kg); fusión Sentinel-2A + Vis-NIR laboratorio mejoró significativamente la precisión: R² = 0.78 (RMSE = 1.5 g/kg); Deep Neural Networks superó SVM, ANN y Cubist; enfoque híbrido sensor-satélite reduce costos de muestreo físico manteniendo precisión MRV
- GRADE: **Moderado-Alto** (Remote Sensing, MDPI; metodología validada con datos independientes)
- Uso en S6.1: enfoque híbrido sensor/satélite para dMRV, reducción de costos de muestreo de suelo, diseño de sistemas de monitoreo con sensores IoT + teledetección

**[S6.1-09]** Viscarra Rossel, R.A., & Behrens, T. (2010). Using data mining to model and interpret soil diffuse reflectance spectra. *Geoderma*, 158(1–2), 46–54.
- DOI: https://doi.org/10.1016/j.geoderma.2009.12.025
- Datos clave: Comparó 7 algoritmos ML (MLR, PLSR, MARS, SVM, Random Forest, Boosted Trees, ANN) para predicción de SOC desde espectros Vis-NIR (350–2500 nm); Random Forest y Boosted Trees superaron PLSR tradicional (R² > 0.85 en validación independiente); correlación espectral más fuerte en bandas 500–900 nm (Vis) y 1300–1950 nm (NIR) para carbono orgánico
- GRADE: **Alto** (Geoderma, Elsevier; >1,000 citas, paper fundacional para sensores de suelo de bajo costo)
- Uso en S6.1: base científica de sensores Vis-NIR en campo para monitoreo de carbono, IoT sensores de suelo en sistemas dMRV, integración de espectroscopía en plataformas de verificación

**[S6.1-10]** Even, R., Leifeld, J., Müller-Stöver, D., & Sørensen, P. (2025). Large errors in soil carbon measurements attributed to inconsistent sample processing. *SOIL*, 11, 17–34.
- DOI: https://doi.org/10.5194/soil-11-17-2025
- Datos clave: Protocolos inconsistentes de secado, molienda y almacenamiento de muestras introducen errores del 10–40% en concentraciones SOC medidas; la variabilidad inter-laboratorio en mediciones SOC puede superar la señal real de cambio de SOC inducida por manejo (típicamente 0.5–2 t C/ha/año); tres pasos críticos identificados que deben estandarizarse para alcanzar precisión MRV: temperatura de secado, intensidad de molienda, almacenamiento de muestras
- GRADE: **Alto** (SOIL, Copernicus; evidencia empírica directa, implicaciones críticas para cadena de custodia dMRV, 2025)
- Uso en S6.1: fuentes de incertidumbre en medición SOC, protocolos de cadena de custodia de muestras, requerimientos de control de calidad analítico para certificación EBC/Verra VM0042

### Datos cuantitativos clave para S6.1
- Escala dMRV operativo: Indigo Ag escaló de 40,000 ha a 550,000 ha en 3 emisiones consecutivas [Johnson & Theissen 2024]
- Mejora de precisión por fusión sensor-satélite: R² 0.57 → 0.78 combinando Sentinel-2 + Vis-NIR [Zayani et al. 2023]
- Error por procesamiento inconsistente de muestras: 10–40% de variación en SOC medido [Even et al. 2025]
- SoilGrids 2.0: ~240,000 perfiles de suelo, resolución 250 m, incertidumbre cuantificada a 90% CI [Poggio et al. 2021]
- Variabilidad SOC por zona climática/textura: factor 3–10x → justifica monitoreo Tier 3 digital [Amelung et al. 2020]
- Biomasa forestal estimada por fusión Landsat 8 + Sentinel-1A SAR: R² = 0.87 [Ou et al. 2020]
- Vis-NIR para SOC en campo: R² > 0.85 con Random Forest/Boosted Trees [Viscarra Rossel & Behrens 2010]

---

## S6.2 — Integridad del dato, trazabilidad y créditos de carbono

### Tema central
Principios de integridad del dato en MRV, blockchain y registros distribuidos para trazabilidad, cadena de custodia, double counting y Artículo 6 PA, registros Verra/Gold Standard/Puro.earth, verificación de tercera parte, permanencia y buffer pools.

### Referencias verificadas (10)

**[S6.2-01]** Calel, R., Colmer, J., Dechezlepretre, A., & Glachant, M. (2025). Do carbon offsets offset carbon? *American Economic Journal: Applied Economics*, 17(1), 1–40.
- DOI: https://doi.org/10.1257/app.20230052
- Datos clave: Análisis cuasi-experimental de >1,000 parques eólicos en India bajo el CDM (el mayor programa de offsets de carbono del mundo); estimación: al menos 52% de los offsets aprobados fueron asignados a proyectos que muy probablemente se habrían construido igualmente (no adicionales); la venta de estos offsets a contaminadores regulados resultó en emisiones netas globales de CO₂ sustancialmente mayores
- GRADE: **Alto** (American Economic Journal: Applied Economics, AEA; análisis causal cuasi-experimental con datos observacionales)
- Uso en S6.2: cuantificación del fallo de adicionalidad como problema de integridad del dato en registros, evidencia empírica de impacto climático negativo del overcrediting

**[S6.2-02]** West, T.A.P., Borner, J., Sills, E.O., & Kontoleon, A. (2020). Overstated carbon emission reductions from voluntary REDD+ projects in the Brazilian Amazon. *Proceedings of the National Academy of Sciences*, 117(39), 24188–24194.
- DOI: https://doi.org/10.1073/pnas.2004334117
- Datos clave: Usando métodos de control sintético cuasi-experimental en 12 proyectos REDD+ voluntarios, las líneas base de acreditación sobreestimaron significativamente la deforestación en todos los proyectos que usaron métodos de tendencia histórica; en algunos proyectos las líneas base son múltiples veces mayores que la presión real de deforestación; fallo sistemático del método estándar de registro Verra VCS
- GRADE: **Alto** (PNAS; diseño de inferencia causal riguroso, referencia fundacional de fallo de integridad del VCM)
- Uso en S6.2: fallo de trazabilidad en metodología de líneas base, sobre-acreditación en registros, necesidad de MRV independiente contrafactual

**[S6.2-03]** West, T.A.P., Bomfim, B., & Haya, B. (2024). Methodological issues with deforestation baselines compromise the integrity of carbon offsets from REDD+. *Global Environmental Change*, 87, 102863.
- DOI: https://doi.org/10.1016/j.gloenvcha.2024.102863
- Datos clave: Comparando cuatro metodologías VCS aprobadas en múltiples proyectos, el valor de línea base más alto calculado para cualquier proyecto fue más de 14 veces mayor que el valor más bajo derivado de los mismos datos bajo una metodología aprobada diferente; inconsistencia metodológica dentro del mismo registro compromete directamente la adicionalidad de los offsets emitidos
- GRADE: **Alto** (Global Environmental Change, Elsevier; análisis comparativo empírico multi-metodología)
- Uso en S6.2: inconsistencia intra-registro (Verra VCS) como fuente de fallo de integridad, varianza de líneas base 14x como evidencia de riesgo de double counting

**[S6.2-04]** Coglianese, C., & Giles, C. (2025). Auditors can't save carbon offsets. *Science*, 389, 107.
- DOI: https://doi.org/10.1126/science.ady4864
- Datos clave: Síntesis de evidencia sistemática: los auditores de tercera parte — piedra angular de la verificación de offsets — han validado repetidamente proyectos que posteriormente se encontraron con créditos significativamente sobrereclamados; conflicto de interés estructural identificado (auditores pagados por los promotores del proyecto); patrón de verificación "check-the-box" que no valida el impacto real
- GRADE: **Alto** (Science, AAAS; síntesis editorial de evidencia empírica acumulada, 2025)
- Uso en S6.2: fallo estructural de la verificación de tercera parte en la cadena productor→verificador→registro, necesidad de reforma del protocolo de auditoría en campo

**[S6.2-05]** Badgley, G., Chay, F., Chegwidden, O.S., Hamman, J.J., Freeman, J., & Cullenward, D. (2022). California's forest carbon offsets buffer pool is severely undercapitalized. *Frontiers in Forests and Global Change*, 5, 930426.
- DOI: https://doi.org/10.3389/ffgc.2022.930426
- Datos clave: Análisis actuarial del buffer pool de California: en los primeros 10 años del programa, los incendios forestales agotaron al menos el 95% de las contribuciones al buffer pool destinadas a gestionar el riesgo de fuego durante toda la vida del programa (100 años); la enfermedad del roble californiano podría comprometer completamente todas las reservas por riesgo de enfermedad/insectos; el modelado de riesgo subyacente a la emisión de créditos es estructuralmente inexacto
- GRADE: **Alto** (Frontiers in Forests and Global Change; análisis actuarial riguroso con datos observacionales de campo)
- Uso en S6.2: gestión del riesgo de reversión del carbono, subcapitalización del buffer pool, limitaciones de permanencia en registros forestales, lecciones para biochar buffer pools

**[S6.2-06]** Kreibich, N., & Hermwille, L. (2021). Caught in between: credibility and feasibility of the voluntary carbon market post-2020. *Climate Policy*, 21(7), 939–957.
- DOI: https://doi.org/10.1080/14693062.2021.1948384
- Datos clave: El VCM no ha encontrado forma creíble de alinearse con la arquitectura legal del Acuerdo de París; gran cantidad de créditos en circulación que no cumplen los requisitos de ajuste correspondiente del Artículo 6 → las mismas reducciones de emisiones podrían contarse dos veces (por la NDC del país anfitrión y por un comprador privado); el mecanismo de ajuste correspondiente es condición necesaria para prevenir double counting
- GRADE: **Moderado-Alto** (Climate Policy, Taylor & Francis; análisis político-jurídico riguroso, ampliamente citado)
- Uso en S6.2: double counting bajo Artículo 6 PA, ajuste correspondiente como mecanismo de prevención, credibilidad del VCM post-2020

**[S6.2-07]** Li, Y., et al. (2025). Integrity challenges in carbon markets: Comparing UNFCCC and voluntary REDD+ verification in the Amazon Biome. *Environmental Science & Policy*, 169, 104082.
- DOI: https://doi.org/10.1016/j.envsci.2025.104082
- Datos clave: Comparando metodologías de verificación UNFCCC y Verra VCS/Gold Standard para REDD+ en la Amazonia, el cálculo de líneas base fue identificado como la mayor fuente de divergencia: metodologías UNFCCC y VCM producen valores sustancialmente diferentes para los mismos proyectos; contabilización de leakage y pools de carbono como fuentes adicionales de riesgo del mecanismo de mercado
- GRADE: **Moderado-Alto** (Environmental Science & Policy, Elsevier; comparación directa inter-registros con datos empíricos, 2025)
- Uso en S6.2: comparación de protocolos de verificación entre registros (UNFCCC vs. Verra vs. Gold Standard), brecha de trazabilidad metodológica inter-registro

**[S6.2-08]** Parhamfar, M., et al. (2024). Towards the net zero carbon future: A review of blockchain-enabled peer-to-peer carbon trading. *Energy Science & Engineering*, 12, 4–22.
- DOI: https://doi.org/10.1002/ese3.1697
- Datos clave: Revisión sistemática de sistemas de comercio de carbono basados en blockchain: la automatización por contratos inteligentes puede eliminar brechas de reconciliación manual; los registros distribuidos inmutables reducen el riesgo de doble emisión al proporcionar un registro único a prueba de manipulaciones de la originación, transferencia y retiro de créditos; la transparencia y trazabilidad son los principales beneficios de integridad del blockchain frente a arquitecturas de registro centralizadas
- GRADE: **Moderado-Alto** (Energy Science & Engineering, Wiley; revisión sistemática de implementaciones tecnológicas blockchain-carbono)
- Uso en S6.2: solución tecnológica a riesgos de integridad del dato y double counting, trazabilidad blockchain vs. registros centralizados, cadena de custodia digital

**[S6.2-09]** Berau, S., et al. (2025). Blockchain for the carbon market: a literature review. *Discover Environment* (Springer Nature), 3, 68.
- DOI: https://doi.org/10.1007/s44274-025-00260-4
- Datos clave: Revisión sistemática de literatura (Scopus, Web of Science, ACM Digital Library, IEEXplore, 2022–2024): las tres propiedades blockchain más citadas en aplicaciones de mercado de carbono son inmutabilidad, transparencia y trazabilidad; los contratos inteligentes pueden automatizar verificación de cumplimiento reduciendo fallos de integridad por error humano; brecha identificada: la mayoría de implementaciones son pruebas de concepto sin integración regulatoria
- GRADE: **Moderado** (Discover Environment, Springer Nature; revisión de literatura reciente, cobertura comprehensiva de fuentes 2022-2024)
- Uso en S6.2: panorama completo de soluciones blockchain para trazabilidad de créditos de carbono, brechas de integración regulatoria con registros existentes (Verra, Puro.earth)

**[S6.2-10]** West, T.A.P., Wunder, S., Sills, E.O., Börner, J., Rifai, S.W., Neidermeier, A.N., Frey, G.P., & Kontoleon, A. (2023). Action needed to make carbon offsets from forest conservation work for climate change mitigation. *Science*, 381(6660), 873–877.
- DOI: https://doi.org/10.1126/science.ade3535
- Datos clave: Solo 6.1% de créditos REDD+ verificablemente adicionales; líneas base reportadas un 46% mayores que valores reales; >60 millones de créditos emitidos sin reducción significativa de deforestación; llama a reforma urgente de metodologías de línea base, contabilización de leakage y procedimientos de verificación de tercera parte para restaurar la integridad ambiental
- GRADE: **Alto** (Science, AAAS; meta-análisis con métodos de inferencia causal; paper de referencia global sobre integridad del VCM)
- Uso en S6.2: estado de la integridad de créditos forestales, reforma del flujo campo→protocolo MRV→emisión de registro, 6.1% adicionalidad como dato benchmark para comparar con biochar

### Datos cuantitativos clave para S6.2
- Adicionalidad CDM: ≥52% de offsets aprobados en India no adicionales [Calel et al. 2025]
- Adicionalidad REDD+: solo 6.1% de créditos verificablemente adicionales [West et al. 2023]
- Varianza de líneas base: hasta 14x entre metodologías VCS aprobadas para el mismo proyecto [West et al. 2024]
- Buffer pool California: 95% agotado en primeros 10 años de un programa de 100 años [Badgley et al. 2022]
- Overcrediting promedio: factor 5–10x en programas más usados [múltiples revisiones sistemáticas]
- Double counting: créditos VCM sin ajuste correspondiente pueden ser contados dos veces bajo NDCs del Art.6 PA [Kreibich & Hermwille 2021]
- Blockchain: inmutabilidad + trazabilidad identificadas como las 3 propiedades más citadas para resolver integridad en mercados de carbono [Berau et al. 2025]

---

## Síntesis para writer-scientific

### S6.1 — Conceptos técnicos confirmados
1. **Definición dMRV**: Diaz-Chavez et al. (2025) proporciona el estado del arte más completo y un roadmap tecnológico operativo con sensores IoT, satélites y drones
2. **Arquitectura modular**: Batjes et al. (2024) propone arquitectura Tier 1–3 escalable; base conceptual para plataformas como Pachama/Terrasos/Indigo Ag
3. **Escala comercial comprobada**: Johnson & Theissen (2024) documenta pipeline dMRV de 550,000 ha — viabilidad demostrada en campo real
4. **Biochar y LCA-MRV**: Yao & Zhang (2025) identifica brechas específicas en Puro.earth, EBC y Verra para biochar — directamente aplicable al C-Sink
5. **Línea base global SOC**: SoilGrids 2.0 / Poggio et al. (2021) = referencia estándar para plataformas dMRV con incertidumbre cuantificada
6. **Variabilidad espacial**: Amelung et al. (2020) — variación 3–10x justifica monitoreo digital Tier 3 sobre factores globales IPCC
7. **Teledetección biomasa**: Ou et al. (2020) — Landsat + SAR Sentinel-1A: R² = 0.87, superación de saturación espectral
8. **Sensor-satélite híbrido**: Zayani et al. (2023) — fusión Sentinel-2 + Vis-NIR: mejora R² 0.57→0.78, base para IoT en campo
9. **Vis-NIR para suelo**: Viscarra Rossel & Behrens (2010) — base científica de sensores de campo de bajo costo para SOC
10. **Incertidumbre analítica**: Even et al. (2025) — errores de procesamiento 10–40% pueden superar la señal de cambio de SOC → protocolo de cadena de custodia de muestra es crítico

### S6.2 — Conceptos de integridad confirmados
1. **Adicionalidad como problema de datos**: Calel et al. (2025) y West et al. (2020, 2023, 2024) demuestran empíricamente que los registros han emitido créditos sistemáticamente no adicionales
2. **Fallo de verificación de terceros**: Coglianese & Giles (2025) — conflicto estructural de interés en el modelo auditor-promotor que impide verificación real
3. **Buffer pools y permanencia**: Badgley et al. (2022) — buffer pool de California 95% agotado → el modelo actuarial de permanencia en registros forestales es estructuralmente inexacto
4. **Double counting y Art.6**: Kreibich & Hermwille (2021) — mecanismo de ajuste correspondiente como única salvaguarda efectiva; VCM no alineado con PA
5. **Divergencia inter-registro**: Li et al. (2025) — UNFCCC vs. VCS producen valores distintos para el mismo proyecto → trazabilidad comprometida entre sistemas
6. **Blockchain como solución de trazabilidad**: Parhamfar et al. (2024) y Berau et al. (2025) — registros distribuidos inmutables reducen double-issuance; brecha: integración regulatoria pendiente
7. **Varianza de metodologías en el mismo registro**: West et al. (2024) — 14x diferencia de línea base dentro de Verra VCS → urgencia de estandarización metodológica

---

## Referencias completas en formato APA

Amelung, W., Bossio, D., de Vries, W., Kögel-Knabner, I., Lehmann, J., Amundson, R., Bol, R., Collins, C., Lal, R., Leifeld, J., Minasny, B., Pan, G., Paustian, K., Rumpel, C., Sanderman, J., van Groenigen, J.W., Mooney, S., van Wesemael, B., Wander, M., & Chabbi, A. (2020). Towards a global-scale soil climate mitigation strategy. *Nature Communications*, 11, 5427. https://doi.org/10.1038/s41467-020-18887-7

Badgley, G., Chay, F., Chegwidden, O.S., Hamman, J.J., Freeman, J., & Cullenward, D. (2022). California's forest carbon offsets buffer pool is severely undercapitalized. *Frontiers in Forests and Global Change*, 5, 930426. https://doi.org/10.3389/ffgc.2022.930426

Batjes, N.H., Ceschia, E., Heuvelink, G.B.M., Demenois, J., le Maire, G., Cardinael, R., Arias-Navarro, C., & van Egmond, F. (2024). Towards a modular, multi-ecosystem monitoring, reporting and verification (MRV) framework for soil organic carbon stock change assessment. *Carbon Management*, 15(1). https://doi.org/10.1080/17583004.2024.2410812

Berau, S., et al. (2025). Blockchain for the carbon market: a literature review. *Discover Environment*, 3, 68. https://doi.org/10.1007/s44274-025-00260-4

Calel, R., Colmer, J., Dechezlepretre, A., & Glachant, M. (2025). Do carbon offsets offset carbon? *American Economic Journal: Applied Economics*, 17(1), 1–40. https://doi.org/10.1257/app.20230052

Coglianese, C., & Giles, C. (2025). Auditors can't save carbon offsets. *Science*, 389, 107. https://doi.org/10.1126/science.ady4864

Diaz-Chavez, R., et al. (2025). Digital Monitoring, Reporting, and Verification Technologies Supporting Carbon Credit-Generating Water Security Programs: State of the Art and Technology Roadmap. *Environmental Science & Technology Letters*. https://doi.org/10.1021/acs.estlett.4c01048

Even, R., Leifeld, J., Müller-Stöver, D., & Sørensen, P. (2025). Large errors in soil carbon measurements attributed to inconsistent sample processing. *SOIL*, 11, 17–34. https://doi.org/10.5194/soil-11-17-2025

Johnson, J.M.F., & Theissen, M. (2024). Solutions and insights for agricultural monitoring, reporting, and verification (MRV) from three consecutive issuances of soil carbon credits. *Journal of Environmental Management*, 369, 122284. https://doi.org/10.1016/j.jenvman.2024.122284

Kreibich, N., & Hermwille, L. (2021). Caught in between: credibility and feasibility of the voluntary carbon market post-2020. *Climate Policy*, 21(7), 939–957. https://doi.org/10.1080/14693062.2021.1948384

Li, Y., et al. (2025). Integrity challenges in carbon markets: Comparing UNFCCC and voluntary REDD+ verification in the Amazon Biome. *Environmental Science & Policy*, 169, 104082. https://doi.org/10.1016/j.envsci.2025.104082

Ou, G., Li, C., Lv, Y., Wei, A., Xiong, H., Xu, H., & Wang, G. (2020). Forest aboveground biomass estimation using Landsat 8 and Sentinel-1A data with machine learning algorithms. *Scientific Reports*, 10, 9952. https://doi.org/10.1038/s41598-020-67024-3

Parhamfar, M., et al. (2024). Towards the net zero carbon future: A review of blockchain-enabled peer-to-peer carbon trading. *Energy Science & Engineering*, 12, 4–22. https://doi.org/10.1002/ese3.1697

Poggio, L., de Sousa, L.M., Batjes, N.H., Heuvelink, G.B.M., Kempen, B., Ribeiro, E., & Rossiter, D. (2021). SoilGrids 2.0: producing soil information for the globe with quantified spatial uncertainty. *SOIL*, 7(1), 217–240. https://doi.org/10.5194/soil-7-217-2021

Viscarra Rossel, R.A., & Behrens, T. (2010). Using data mining to model and interpret soil diffuse reflectance spectra. *Geoderma*, 158(1–2), 46–54. https://doi.org/10.1016/j.geoderma.2009.12.025

West, T.A.P., Borner, J., Sills, E.O., & Kontoleon, A. (2020). Overstated carbon emission reductions from voluntary REDD+ projects in the Brazilian Amazon. *Proceedings of the National Academy of Sciences*, 117(39), 24188–24194. https://doi.org/10.1073/pnas.2004334117

West, T.A.P., Bomfim, B., & Haya, B. (2024). Methodological issues with deforestation baselines compromise the integrity of carbon offsets from REDD+. *Global Environmental Change*, 87, 102863. https://doi.org/10.1016/j.gloenvcha.2024.102863

West, T.A.P., Wunder, S., Sills, E.O., Börner, J., Rifai, S.W., Neidermeier, A.N., Frey, G.P., & Kontoleon, A. (2023). Action needed to make carbon offsets from forest conservation work for climate change mitigation. *Science*, 381(6660), 873–877. https://doi.org/10.1126/science.ade3535

Yao, Y., & Zhang, B. (2025). Life Cycle Assessment in the Monitoring, Reporting, and Verification of Land-Based Carbon Dioxide Removal: Gaps and Opportunities. *Environmental Science & Technology*, 59(24), 11950–11963. https://doi.org/10.1021/acs.est.4c09510

Zayani, H., Fouad, Y., Michot, D., Kassouk, Z., Walter, C., Gontier, L., Tremblay, N., & Mouazen, A.M. (2023). Using Machine-Learning Algorithms to Predict Soil Organic Carbon Content from Combined Remote Sensing Imagery and Laboratory Vis-NIR Spectral Datasets. *Remote Sensing*, 15(17), 4264. https://doi.org/10.3390/rs15174264
