/* ===== Educational content (Spanish). Citations map to REFS keys. ===== */

// Illustrative α1(I)-like helical sequence. Pro in Y position shown as Hyp (O).
const SEQUENCE = 'GPMGPSGPRGLPGPPGAPGPQGFQGPPGEPGEPGASGPMGPRGPP'
  .split('').map((ch, i) => (i % 3 === 2 && ch === 'P') ? 'O' : ch);

const HIERARCHY = [
  { key: 'aa', name: 'Aminoácidos', size: '≈ 0,29 nm', unit: 'avance por residuo', force: 'Enlaces covalentes · enlace peptídico',
    text: 'La unidad repetitiva es el triplete <b>Gly-X-Y</b>. Pro y Hyp suman cerca del 20 % de los residuos: sus anillos rígidos limitan los ángulos φ del esqueleto. Así la cadena queda "preorganizada" antes de formar la hélice.', cite: 'Shoulders y Raines, 2009' },
  { key: 'alpha', name: 'Cadena α', size: '≈ 1000', unit: 'residuos en el dominio helicoidal', force: 'Repulsión estérica de los anillos de Pro/Hyp',
    text: 'Cada cadena forma una <b>hélice de poliprolina II levógira</b> (~3,3 residuos por vuelta). A diferencia de la α-hélice, <b>no</b> tiene puentes de H internos. La mantienen la rigidez de los anillos y el carácter <i>trans</i> de sus enlaces peptídicos.', cite: 'Shoulders y Raines, 2009' },
  { key: 'triple', name: 'Triple hélice', size: '300 × 1,5 nm', unit: 'tropocolágeno', force: 'Puentes de H N–H(Gly)···O=C(X) entre cadenas',
    text: 'Tres cadenas α, desfasadas un residuo, se enrollan en una <b>superhélice dextrógira</b>. En el tipo I la molécula es [α1(I)]₂α2(I). Hay un puente de H por triplete entre cadenas, reforzado por puentes de agua con los –OH de la Hyp.', cite: 'Bella et al., 1994' },
  { key: 'fibril', name: 'Fibrilla', size: '20 – 500 nm', unit: 'de diámetro · período D = 67 nm', force: 'Autoensamblaje + entrecruzamientos covalentes',
    text: 'Las moléculas se escalonan ~¼ de su longitud. Así aparecen zonas de <b>hueco</b> y de <b>solapamiento</b> que producen las bandas de 67 nm. La lisil oxidasa forma entrecruzamientos covalentes entre telopéptidos y moléculas vecinas: aquí nace la resistencia a la tracción.', cite: 'Buehler, 2006' },
  { key: 'fiber', name: 'Fibra', size: '≈ 1 – 20 µm', unit: 'de diámetro', force: 'Proteoglicanos y deslizamiento interfibrilar',
    text: 'Haces de fibrillas unidos por proteoglicanos. Cuando se estira, las fibrillas se deslizan entre sí y disipan energía. Por eso el tejido es <b>tenaz</b> y no frágil.', cite: 'Fratzl, 2008' },
  { key: 'tissue', name: 'Tejido', size: 'mm – cm', unit: 'tendón, piel, hueso', force: 'Arquitectura del tejido (ondulación o "crimp")',
    text: 'En el tendón, las fibras paralelas y onduladas dan una resistencia de ~50–150 MPa. En la piel forman una red; en el hueso sirven de molde para la hidroxiapatita. <b>Al extraer el colágeno se pierde esta jerarquía</b>, y por eso los biomateriales reconstituidos son más débiles.', cite: 'Fratzl, 2008' },
];

const APPS = [
  { name: 'Andamios 3D', sub: 'Ingeniería de tejidos', key: 'Secuencias de adhesión (GFOGER) + porosidad',
    text: 'Esponjas liofilizadas con poros interconectados. Las células se adhieren mediante integrinas que reconocen motivos como GFOGER en la triple hélice.',
    ex: 'Ej.: matrices de regeneración dérmica de colágeno–glicosaminoglicano.', art: 'scaffold' },
  { name: 'Apósitos', sub: 'Heridas y quemaduras', key: 'Hidrofilia de grupos polares (–OH, –NH₃⁺, –COO⁻)',
    text: 'Los grupos polares retienen agua y mantienen el ambiente húmedo de la herida. Además, los fragmentos de colágeno atraen fibroblastos.',
    ex: 'Ej.: láminas y polvos de colágeno para úlceras crónicas.', art: 'skin' },
  { name: 'Hemostáticos', sub: 'Control de sangrado', key: 'Estructura fibrilar nativa activa plaquetas',
    text: 'Las plaquetas se unen a las fibrillas de colágeno (receptores GPVI y α2β1). Se agregan y disparan la coagulación en el sitio de sangrado.',
    ex: 'Ej.: colágeno microfibrilar y esponjas hemostáticas quirúrgicas.', art: 'drop' },
  { name: 'Suturas', sub: 'Biodegradables', key: 'Enlace peptídico hidrolizable por colagenasas',
    text: 'Las MMP hidrolizan la sutura y esta se reabsorbe sin tener que retirarla. La velocidad se ajusta con el grado de entrecruzamiento.',
    ex: 'Ej.: suturas de catgut (intestino animal rico en colágeno).', art: 'suture' },
  { name: 'Hueso y cartílago', sub: 'Matrices compuestas', key: 'Grupos –COO⁻ nuclean hidroxiapatita',
    text: 'Los grupos carboxilato y las zonas de hueco de la fibrilla sirven de sitio de nucleación del fosfato de calcio. Por eso imita la estructura del hueso.',
    ex: 'Ej.: compuestos colágeno/hidroxiapatita para defectos óseos.', art: 'bone' },
  { name: 'Liberación de fármacos', sub: 'Sistemas de entrega', key: 'Grupos ionizables + degradación controlada',
    text: 'Los fármacos se unen a la matriz por interacciones iónicas con los grupos cargados. Se liberan a medida que la matriz se degrada.',
    ex: 'Ej.: esponjas con antibiótico y escudos corneales.', art: 'drug' },
];

const CROSSLINKERS = {
  ga: { name: 'Glutaraldehído', mech: '<em>OHC–(CH₂)₃–CHO</em> + 2 Lys–NH₂<br>→ Lys–N=CH–(CH₂)₃–CH=N–Lys + 2 H₂O<br><span style="color:#9aa0cc">bases de Schiff (y polímeros de aldol)</span>',
    text: 'Es el más eficaz y barato: aumenta mucho la resistencia y la estabilidad. Su problema es que los aldehídos sin reaccionar son <b>citotóxicos</b> y favorecen la calcificación.', m: { ef: 95, tox: 85, cost: 15 } },
  gen: { name: 'Genipina', mech: 'Genipina (iridoide de <i>Gardenia jasminoides</i>)<br>+ Lys–NH₂ → ataque nucleofílico al C3<br>→ apertura de anillo → <em>entrecruzamiento heterocíclico</em> (azul)',
    text: 'Es de origen natural. In vitro se reporta una citotoxicidad varios órdenes de magnitud menor que la del glutaraldehído (Sung et al., 1999). Sus desventajas: tiñe de azul y es más cara.', m: { ef: 75, tox: 15, cost: 70 } },
  edc: { name: 'EDC / NHS', mech: 'Asp/Glu–COOH + EDC → <em>O-acilisourea</em><br>+ NHS → éster activado<br>+ Lys–NH₂ → <em>enlace amida</em> (Asp–CO–NH–Lys)',
    text: 'Es un entrecruzante <b>de longitud cero</b>: no queda incorporado al material. Forma enlaces amida directos y la urea subproducto se elimina por lavado. Es muy biocompatible, pero el entrecruzamiento es más moderado.', m: { ef: 60, tox: 10, cost: 55 } },
  dht: { name: 'Deshidrotérmico', mech: 'Calor (≈ 110–140 °C) al vacío<br>–COOH + H₂N– → <em>amida</em> + H₂O↑<br><span style="color:#9aa0cc">condensación sin reactivos</span>',
    text: 'No usa químicos, así que no hay residuos tóxicos. Su desventaja es que el calor <b>desnaturaliza parcialmente</b> la triple hélice y el entrecruzamiento logrado es bajo.', m: { ef: 35, tox: 5, cost: 20 } },
};

const SOURCES = [
  { src: 'Bovina', from: 'Piel y tendón de res', cost: 1, risk: ['hi', 'EEB (priones), alergia'], tm: '≈ 40 °C', note: 'La más usada; amplia trayectoria clínica' },
  { src: 'Porcina', from: 'Piel de cerdo', cost: 1, risk: ['mid', 'Zoonosis; restricción religiosa'], tm: '≈ 40 °C', note: 'Muy similar al humano' },
  { src: 'Marina', from: 'Piel y escamas de pescado, medusa', cost: 2, risk: ['lo', 'Sin EEB; alergia a pescado'], tm: '≈ 15–30 °C', note: 'Menos Pro/Hyp → menor estabilidad térmica' },
  { src: 'Recombinante humana', from: 'Levaduras, plantas de tabaco', cost: 5, risk: ['lo', 'Mínimo'], tm: 'Variable*', note: 'Idéntica y reproducible; *requiere co-expresar la prolil-4-hidroxilasa' },
];

const QUIZ = [
  { q: '¿Por qué la glicina debe ocupar cada tercera posición de la cadena?',
    o: ['Porque es el aminoácido más abundante en la dieta', 'Porque su cadena lateral (–H) es la única que cabe en el centro de la triple hélice', 'Porque forma enlaces disulfuro entre cadenas', 'Porque es el único aminoácido quiral'],
    a: 1, e: 'Cada tercer residuo queda en el eje central, donde casi no hay espacio. Cualquier cadena lateral mayor que –H provoca un choque estérico y deforma la hélice.' },
  { q: '¿Qué papel cumple la vitamina C en la síntesis de colágeno?',
    o: ['Es el sustrato que se incorpora como –OH', 'Mantiene el hierro de la prolil-4-hidroxilasa en estado Fe²⁺', 'Forma los entrecruzamientos de lisina', 'Rompe los enlaces peptídicos'],
    a: 1, e: 'El ascorbato reduce el Fe³⁺ a Fe²⁺ en el sitio activo de la enzima. Sin él hay poca Hyp, la hélice se desnaturaliza a 37 °C y aparece el escorbuto.' },
  { q: 'El enlace peptídico es plano y rígido porque…',
    o: ['El nitrógeno tiene hibridación sp³', 'La resonancia le da carácter parcial de doble enlace al C–N', 'Forma un puente de hidrógeno interno', 'El oxígeno está protonado'],
    a: 1, e: 'El par libre del N se deslocaliza hacia el C=O. El enlace C–N queda en ~1,33 Å, sin rotación libre, y los seis átomos de la amida quedan en un mismo plano.' },
  { q: '¿Qué interacción une principalmente las tres cadenas α entre sí?',
    o: ['Enlaces disulfuro', 'Puentes de H N–H(Gly)···O=C(X) entre cadenas', 'Interacciones π–π entre anillos aromáticos', 'Enlaces iónicos con metales'],
    a: 1, e: 'Hay un puente de H directo por triplete: el N–H de la Gly de una cadena con el C=O del residuo X de la cadena vecina (Bella et al., 1994).' },
  { q: 'La hidroxiprolina (4R) estabiliza la triple hélice principalmente mediante…',
    o: ['Puentes de H con el agua únicamente', 'Un efecto estereoelectrónico (gauche) que fija el pliegue Cγ-exo del anillo', 'Su carga negativa', 'Enlaces covalentes con la glicina'],
    a: 1, e: 'El –OH electronegativo en 4R favorece el pliegue Cγ-exo, que preorganiza los ángulos del esqueleto. La prueba: la 4-fluoroprolina, que no forma puentes de H, estabiliza aún más (Shoulders y Raines, 2009).' },
  { q: '¿Qué enzima inicia los entrecruzamientos covalentes entre moléculas de colágeno?',
    o: ['Colagenasa', 'Lisil oxidasa', 'Pepsina', 'Prolil-4-hidroxilasa'],
    a: 1, e: 'La lisil oxidasa (dependiente de Cu²⁺) oxida el ε-amino de Lys/Hyl a aldehído (alisina). Este se condensa con residuos vecinos.' },
  { q: '¿Por qué el colágeno de peces de aguas frías suele tener menor temperatura de desnaturalización?',
    o: ['Porque no tiene glicina', 'Porque tiene menor contenido de Pro e Hyp', 'Porque es una α-hélice', 'Porque tiene más entrecruzamientos'],
    a: 1, e: 'Menos Pro/Hyp significa menos preorganización y menor estabilidad. Es una limitación del colágeno marino como biomaterial a 37 °C.' },
  { q: 'La principal ventaja del EDC/NHS frente al glutaraldehído es que…',
    o: ['Es más barato', 'Es de longitud cero: forma amidas directas y no queda incorporado', 'Produce entrecruzamientos más fuertes', 'Tiñe el material de azul'],
    a: 1, e: 'El EDC activa los –COOH para que reaccionen con los –NH₂. El reactivo sale como urea soluble y el material queda con enlaces amida propios, sin residuos tóxicos.' },
  { q: 'En la osteogénesis imperfecta, una mutación típica…',
    o: ['Elimina toda la prolina', 'Sustituye una Gly por un residuo más voluminoso y distorsiona la triple hélice', 'Aumenta los entrecruzamientos', 'Convierte la hélice en lámina β'],
    a: 1, e: 'Las sustituciones de Gly en COL1A1/COL1A2 rompen localmente la hélice. Cambian la interacción entre moléculas y la mecánica de la fibrilla, y el hueso queda frágil (Gautieri et al., 2009).' },
];

const REFS = [
  'Bella, J., Eaton, M., Brodsky, B., & Berman, H. M. (1994). Crystal and molecular structure of a collagen-like peptide at 1.9 Å resolution. <i>Science, 266</i>(5182), 75–81. <a href="https://doi.org/10.1126/science.7695699" target="_blank" rel="noopener">https://doi.org/10.1126/science.7695699</a>',
  'Berisio, R., Vitagliano, L., Mazzarella, L., & Zagari, A. (2002). Crystal structure of the collagen triple helix model [(Pro-Pro-Gly)10]3. <i>Protein Science, 11</i>(2), 262–270. <a href="https://doi.org/10.1110/ps.32602" target="_blank" rel="noopener">https://doi.org/10.1110/ps.32602</a>',
  'Berman, H. M., Westbrook, J., Feng, Z., Gilliland, G., Bhat, T. N., Weissig, H., Shindyalov, I. N., & Bourne, P. E. (2000). The Protein Data Bank. <i>Nucleic Acids Research, 28</i>(1), 235–242. <a href="https://doi.org/10.1093/nar/28.1.235" target="_blank" rel="noopener">https://doi.org/10.1093/nar/28.1.235</a>',
  'Buehler, M. J. (2006). Nature designs tough collagen: Explaining the nanostructure of collagen fibrils. <i>Proceedings of the National Academy of Sciences, 103</i>(33), 12285–12290. <a href="https://doi.org/10.1073/pnas.0603216103" target="_blank" rel="noopener">https://doi.org/10.1073/pnas.0603216103</a>',
  'Fratzl, P. (Ed.). (2008). <i>Collagen: Structure and mechanics</i>. Springer. <a href="https://doi.org/10.1007/978-0-387-73906-9" target="_blank" rel="noopener">https://doi.org/10.1007/978-0-387-73906-9</a>',
  'Gautieri, A., Uzel, S., Vesentini, S., Redaelli, A., & Buehler, M. J. (2009). Molecular and mesoscale mechanisms of osteogenesis imperfecta disease in collagen fibrils. <i>Biophysical Journal, 97</i>(3), 857–865. <a href="https://doi.org/10.1016/j.bpj.2009.04.059" target="_blank" rel="noopener">https://doi.org/10.1016/j.bpj.2009.04.059</a>',
  'Gelse, K., Pöschl, E., & Aigner, T. (2003). Collagens—structure, function, and biosynthesis. <i>Advanced Drug Delivery Reviews, 55</i>(12), 1531–1546. <a href="https://doi.org/10.1016/j.addr.2003.08.002" target="_blank" rel="noopener">https://doi.org/10.1016/j.addr.2003.08.002</a>',
  'Lee, C. H., Singla, A., & Lee, Y. (2001). Biomedical applications of collagen. <i>International Journal of Pharmaceutics, 221</i>(1–2), 1–22. <a href="https://doi.org/10.1016/S0378-5173(01)00691-3" target="_blank" rel="noopener">https://doi.org/10.1016/S0378-5173(01)00691-3</a>',
  'Parenteau-Bareil, R., Gauvin, R., & Berthod, F. (2010). Collagen-based biomaterials for tissue engineering applications. <i>Materials, 3</i>(3), 1863–1887. <a href="https://doi.org/10.3390/ma3031863" target="_blank" rel="noopener">https://doi.org/10.3390/ma3031863</a>',
  'Rego, N., & Koes, D. (2015). 3Dmol.js: Molecular visualization with WebGL. <i>Bioinformatics, 31</i>(8), 1322–1324. <a href="https://doi.org/10.1093/bioinformatics/btu829" target="_blank" rel="noopener">https://doi.org/10.1093/bioinformatics/btu829</a>',
  'Ricard-Blum, S. (2011). The collagen family. <i>Cold Spring Harbor Perspectives in Biology, 3</i>(1), a004978. <a href="https://doi.org/10.1101/cshperspect.a004978" target="_blank" rel="noopener">https://doi.org/10.1101/cshperspect.a004978</a>',
  'Shoseyov, O., Posen, Y., & Grynspan, F. (2014). Human collagen produced in plants: More than just another molecule. <i>Bioengineered, 5</i>(1), 49–52. <a href="https://doi.org/10.4161/bioe.26002" target="_blank" rel="noopener">https://doi.org/10.4161/bioe.26002</a>',
  'Shoulders, M. D., & Raines, R. T. (2009). Collagen structure and stability. <i>Annual Review of Biochemistry, 78</i>, 929–958. <a href="https://doi.org/10.1146/annurev.biochem.77.032207.120833" target="_blank" rel="noopener">https://doi.org/10.1146/annurev.biochem.77.032207.120833</a>',
  'Sung, H.-W., Huang, R.-N., Huang, L. L. H., & Tsai, C.-C. (1999). In vitro evaluation of cytotoxicity of a naturally occurring cross-linking reagent for biological tissue fixation. <i>Journal of Biomaterials Science, Polymer Edition, 10</i>(1), 63–78. <a href="https://doi.org/10.1163/156856299X00289" target="_blank" rel="noopener">https://doi.org/10.1163/156856299X00289</a>',
];

const PDB_LIST = [
  { id: '1CAG', title: 'Gly → Ala sustituida', desc: '(Pro-Hyp-Gly)₄-Pro-Hyp-Ala-(Pro-Hyp-Gly)₅. Modelo de la mutación de la osteogénesis imperfecta (Bella et al., 1994).', mutant: true },
  { id: '1K6F', title: 'Hélice modelo (Pro-Pro-Gly)₁₀', desc: 'Triple hélice "ideal" a alta resolución, sin sustituciones (Berisio et al., 2002).' },
  { id: '1BKV', title: 'Péptido con secuencia natural', desc: 'Contiene un tramo de secuencia del colágeno tipo III humano con residuos cargados.' },
];
