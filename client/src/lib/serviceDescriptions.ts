/**
 * Descripciones detalladas de servicios para la página /servicios
 * Cada servicio incluye: qué es, beneficios, duración, cuidados
 * IMPORTANTE: Los keys deben coincidir EXACTAMENTE con los nombres en la BD
 */

export const serviceDescriptions: Record<string, {
  title: string;
  whatIs: string;
  benefits: string[];
  duration: string;
  care: string[];
}> = {
  // ═══ NUTRICIÓN ═══
  "Asesoría Nutricional Personalizada": {
    title: "Asesoría Nutricional Personalizada",
    whatIs: "Consulta con nutriólogo profesional donde se realiza evaluación completa de tus hábitos alimenticios, estado de salud y objetivos personales. Se diseña un plan nutricional personalizado adaptado a tu estilo de vida, preferencias y necesidades específicas.",
    benefits: [
      "Plan alimenticio personalizado según tus objetivos",
      "Mejora de energía y vitalidad",
      "Pérdida de peso saludable y sostenible",
      "Mejor digestión y bienestar general",
      "Prevención de enfermedades crónicas",
      "Seguimiento profesional continuo"
    ],
    duration: "Consulta inicial: 60 minutos | Seguimientos: 30-45 minutos",
    care: [
      "Sigue el plan nutricional recomendado",
      "Mantén hidratación adecuada (2-3 litros de agua diaria)",
      "Registra tus comidas para el seguimiento",
      "Asiste a tus citas de seguimiento programadas",
      "Comunica cambios en tu salud o medicamentos"
    ]
  },

  // ═══ CORPORALES ═══
  "Cavitación 80K y 120K": {
    title: "Cavitación 80K y 120K",
    whatIs: "Tratamiento no invasivo que utiliza ondas ultrasónicas de alta frecuencia para romper células de grasa localizada. Las ondas crean burbujas que colapsan las membranas de las células adiposas, permitiendo que el cuerpo las elimine naturalmente.",
    benefits: [
      "Reducción de grasa localizada sin cirugía",
      "Contornos corporales más definidos",
      "Sin tiempo de inactividad",
      "Resultados visibles desde la primera sesión",
      "Estimulación del drenaje linfático",
      "Mejora de la textura de la piel"
    ],
    duration: "45-60 minutos por sesión | Programa de 6-8 sesiones",
    care: [
      "Bebe mucha agua después del tratamiento (2-3 litros)",
      "Realiza actividad física moderada",
      "Evita alimentos grasosos por 48 horas",
      "Mantén la piel hidratada",
      "Usa ropa cómoda después del tratamiento",
      "Completa el programa para mejores resultados"
    ]
  },

  "Radiofrecuencia Corporal": {
    title: "Radiofrecuencia Corporal",
    whatIs: "Tratamiento que utiliza ondas de radiofrecuencia para estimular colágeno y elastina en capas profundas de la piel corporal. Produce calor controlado que reafirma, reduce medidas y mejora la textura sin dañar la superficie.",
    benefits: [
      "Piel más firme y reafirmada",
      "Reducción de medidas corporales",
      "Estimulación de colágeno natural",
      "Mejora de flacidez",
      "Efecto lifting corporal",
      "Resultados progresivos y duraderos"
    ],
    duration: "60-90 minutos por sesión",
    care: [
      "Evita el sol directo por 48 horas",
      "Usa protector solar SPF 50+",
      "Mantén la piel hidratada",
      "Evita productos irritantes por 3 días",
      "No uses agua muy caliente",
      "Realiza sesiones cada 2-4 semanas"
    ]
  },

  "Vacuumterapia": {
    title: "Vacuumterapia",
    whatIs: "Tratamiento que utiliza succión controlada con ventosas especializadas para mejorar la circulación, drenaje linfático y estimular la regeneración de tejidos. Ideal para reducir celulitis, mejorar textura y favorecer la eliminación de toxinas.",
    benefits: [
      "Mejora significativa de celulitis",
      "Aumento de circulación sanguínea",
      "Estimulación del drenaje linfático",
      "Piel más lisa y uniforme",
      "Reducción de medidas",
      "Efecto desintoxicante"
    ],
    duration: "60 minutos por sesión",
    care: [
      "Bebe mucha agua después del tratamiento",
      "Evita el sol directo por 48 horas",
      "Usa ropa cómoda y suelta",
      "Realiza actividad física moderada",
      "Mantén la piel hidratada",
      "Repite sesiones cada 2 semanas"
    ]
  },

  "Láser Lipolítico No Invasivo (Hipoláser)": {
    title: "Láser Lipolítico No Invasivo (Hipoláser)",
    whatIs: "Tratamiento con láser de baja potencia que penetra en el tejido adiposo, estimulando la liberación de grasas de las células sin destruirlas. El cuerpo elimina naturalmente las grasas liberadas a través del sistema linfático.",
    benefits: [
      "Reducción de grasa sin cirugía",
      "Sin dolor ni molestias",
      "Sin tiempo de recuperación",
      "Resultados naturales y progresivos",
      "Mejora de contornos corporales",
      "Estimulación del metabolismo"
    ],
    duration: "30-45 minutos por sesión | Programa de 8-10 sesiones",
    care: [
      "Bebe mucha agua para favorecer drenaje",
      "Realiza actividad física moderada",
      "Evita alimentos ultraprocesados",
      "Mantén la piel hidratada",
      "Usa ropa cómoda después del tratamiento",
      "Completa el programa para mejores resultados"
    ]
  },

  "Martillo Vibrador Corporal": {
    title: "Martillo Vibrador Corporal",
    whatIs: "Dispositivo de vibración de alta frecuencia que estimula la musculatura y el tejido conectivo. Mejora la circulación, reduce tensión muscular y favorece la eliminación de grasa localizada mediante vibración mecánica controlada.",
    benefits: [
      "Alivio de tensión muscular",
      "Mejora de circulación sanguínea",
      "Estimulación del metabolismo",
      "Reducción de medidas",
      "Mejora de la textura de la piel",
      "Sensación de relajación y bienestar"
    ],
    duration: "45-60 minutos",
    care: [
      "Bebe agua después del tratamiento",
      "Realiza estiramientos suaves",
      "Evita actividad física intensa por 24 horas",
      "Mantén la piel hidratada",
      "Usa ropa cómoda",
      "Repite sesiones cada 2 semanas"
    ]
  },

  "Vacuum con Copas para Glúteos": {
    title: "Vacuum con Copas para Glúteos",
    whatIs: "Tratamiento especializado que utiliza copas de succión para estimular los glúteos, mejorando su forma, firmeza y volumen. Aumenta la circulación, estimula colágeno y favorece la eliminación de grasa localizada en la zona.",
    benefits: [
      "Glúteos más firmes y levantados",
      "Aumento de volumen natural",
      "Mejora de la textura de la piel",
      "Reducción de celulitis en glúteos",
      "Efecto lifting glúteo",
      "Resultados visibles y duraderos"
    ],
    duration: "45-60 minutos",
    care: [
      "Evita el sol directo por 48 horas",
      "Usa ropa cómoda y suelta",
      "Mantén la piel hidratada",
      "Realiza actividad física moderada",
      "Evita baños muy calientes por 24 horas",
      "Repite sesiones cada 2-3 semanas"
    ]
  },

  "Aplicación de Enzimas Reductoras": {
    title: "Aplicación de Enzimas Reductoras",
    whatIs: "Tratamiento que aplica enzimas naturales especializadas que penetran en el tejido adiposo, acelerando la descomposición de grasas. Las enzimas estimulan el metabolismo celular para una reducción más rápida y efectiva de medidas.",
    benefits: [
      "Aceleración de la reducción de grasa",
      "Resultados más rápidos que otros tratamientos",
      "Estimulación del metabolismo",
      "Mejora de contornos corporales",
      "Reducción de medidas visible",
      "Complemento perfecto para otros tratamientos"
    ],
    duration: "60 minutos por sesión | Programa de 6-8 sesiones",
    care: [
      "Bebe mucha agua después del tratamiento",
      "Realiza actividad física moderada",
      "Sigue plan nutricional recomendado",
      "Evita alimentos grasosos",
      "Mantén la piel hidratada",
      "Completa el programa para mejores resultados"
    ]
  },

  "Mesoterapia Reductora": {
    title: "Mesoterapia Reductora",
    whatIs: "Inyección de microgotas de sustancias reductoras (cafeína, carnitina, fosfolípidos) en la capa media de la piel. Estimula la descomposición de grasas, mejora la circulación y favorece la eliminación de toxinas y grasa localizada.",
    benefits: [
      "Reducción efectiva de grasa localizada",
      "Mejora de la circulación",
      "Estimulación del drenaje linfático",
      "Reducción de medidas visible",
      "Mejora de la textura de la piel",
      "Resultados progresivos"
    ],
    duration: "45-60 minutos por sesión | Programa de 6-8 sesiones",
    care: [
      "Evita el sol directo por 48 horas",
      "Usa protector solar SPF 50+",
      "No hagas ejercicio intenso por 24 horas",
      "Mantén la piel hidratada",
      "Evita productos irritantes por 3 días",
      "Completa el programa para mejores resultados"
    ]
  },

  // ═══ FACIALES ═══
  "Diagnóstico Facial con Monitor de Piel": {
    title: "Diagnóstico Facial con Monitor de Piel",
    whatIs: "Análisis profesional de la piel usando tecnología de monitor especializado que detecta problemas profundos: hidratación, elasticidad, manchas, arrugas y daño solar. Proporciona un diagnóstico detallado para diseñar el tratamiento facial personalizado.",
    benefits: [
      "Diagnóstico preciso del estado de la piel",
      "Identificación de problemas profundos",
      "Base para tratamientos personalizados",
      "Monitoreo del progreso en el tiempo",
      "Recomendaciones específicas",
      "Documentación visual del antes y después"
    ],
    duration: "30-45 minutos",
    care: [
      "Llega con la piel limpia",
      "Evita maquillaje el día del diagnóstico",
      "Comunica sensibilidades de piel",
      "Anota preguntas antes de la cita",
      "Sigue recomendaciones del profesional"
    ]
  },

  "Limpieza Facial Profunda": {
    title: "Limpieza Facial Profunda",
    whatIs: "Tratamiento facial completo que incluye limpieza profunda, exfoliación, extracción de comedones, masaje facial y aplicación de mascarilla según tipo de piel. Elimina impurezas, desobstruye poros y prepara la piel para otros tratamientos.",
    benefits: [
      "Poros limpios y desobstruidos",
      "Eliminación de puntos negros y espinillas",
      "Piel más clara y radiante",
      "Mejora de la textura",
      "Preparación para otros tratamientos",
      "Sensación de frescura inmediata"
    ],
    duration: "60-90 minutos",
    care: [
      "Evita tocar tu cara durante 24 horas",
      "No uses maquillaje por 24 horas",
      "Usa protector solar SPF 50+",
      "Mantén la piel hidratada",
      "Evita productos irritantes por 3 días",
      "Bebe mucha agua"
    ]
  },

  "Hidratación Facial con Ácido Hialurónico": {
    title: "Hidratación Facial con Ácido Hialurónico",
    whatIs: "Tratamiento facial que utiliza ácido hialurónico de alta concentración para proporcionar hidratación profunda y duradera. Rellena la piel desde adentro, mejora la elasticidad y proporciona un aspecto más juvenil y radiante.",
    benefits: [
      "Hidratación profunda y duradera",
      "Piel más suave y luminosa",
      "Reducción de líneas finas",
      "Mejora de la elasticidad",
      "Efecto plumping inmediato",
      "Resultados visibles desde la primera sesión"
    ],
    duration: "45-60 minutos",
    care: [
      "Evita el sol directo por 48 horas",
      "Usa protector solar SPF 50+",
      "Mantén la piel hidratada",
      "Evita productos irritantes por 3 días",
      "No exfolies por 1 semana",
      "Repite cada 2-4 semanas"
    ]
  },

  "Radiofrecuencia Facial": {
    title: "Radiofrecuencia Facial",
    whatIs: "Tratamiento no invasivo que usa ondas de radiofrecuencia para estimular colágeno y elastina en capas profundas de la piel. Produce calor controlado que reafirma y rejuvenece sin dañar la superficie.",
    benefits: [
      "Piel más firme y reafirmada",
      "Reducción de arrugas finas",
      "Mejora de la flacidez",
      "Estimulación de colágeno",
      "Efecto lifting natural",
      "Resultados progresivos"
    ],
    duration: "45-60 minutos",
    care: [
      "Evita el sol por 48 horas",
      "Usa protector solar SPF 50+",
      "Mantén la piel hidratada",
      "Evita productos ácidos por 3 días",
      "No uses agua muy caliente",
      "Realiza sesiones cada 2-4 semanas"
    ]
  },

  "Peeling Químico": {
    title: "Peeling Químico",
    whatIs: "Exfoliación química controlada que utiliza ácidos especializados para remover capas de piel dañada. Mejora la textura, reduce manchas, cicatrices y estimula la regeneración natural de la piel.",
    benefits: [
      "Piel más lisa y uniforme",
      "Reducción de manchas y cicatrices",
      "Mejora significativa de la textura",
      "Estimulación de colágeno",
      "Reducción de arrugas finas",
      "Brillo y luminosidad renovada"
    ],
    duration: "45-60 minutos",
    care: [
      "Evita el sol completamente por 2 semanas",
      "Usa protector solar SPF 70+",
      "Mantén la piel muy hidratada",
      "Evita maquillaje por 48 horas",
      "Descamación es normal (3-7 días)",
      "Evita productos ácidos por 1 semana"
    ]
  },

  "Microdermoabrasión": {
    title: "Microdermoabrasión",
    whatIs: "Exfoliación mecánica suave que utiliza cristales finos para remover células muertas y capas superficiales de piel. Mejora la textura, suaviza cicatrices, líneas finas y manchas de forma no invasiva.",
    benefits: [
      "Piel más suave y luminosa",
      "Reducción de cicatrices y líneas finas",
      "Mejora de la textura general",
      "Estimulación de colágeno",
      "Sin tiempo de inactividad",
      "Resultados inmediatos"
    ],
    duration: "45-60 minutos",
    care: [
      "Evita el sol directo por 48 horas",
      "Usa protector solar SPF 50+",
      "Mantén la piel hidratada",
      "Evita productos ácidos por 3 días",
      "No exfolies por 1 semana",
      "Repite cada 2-4 semanas"
    ]
  },

  "Plasma Rico en Plaquetas (PRP Facial)": {
    title: "Plasma Rico en Plaquetas (PRP Facial)",
    whatIs: "Tratamiento regenerativo que utiliza plasma de tu propia sangre concentrado en plaquetas. Se inyecta en la piel para estimular colágeno, mejorar textura y rejuvenecer de forma natural, aprovechando los factores de crecimiento del cuerpo.",
    benefits: [
      "Rejuvenecimiento natural con tus propias células",
      "Estimulación potente de colágeno",
      "Mejora de cicatrices y textura",
      "Piel más luminosa y radiante",
      "Resultados duraderos (6-12 meses)",
      "Sin riesgo de rechazo (es tu propia sangre)"
    ],
    duration: "60-90 minutos",
    care: [
      "Evita el sol directo por 2 semanas",
      "Usa protector solar SPF 70+",
      "No hagas ejercicio intenso por 48 horas",
      "Evita alcohol por 48 horas",
      "Mantén la piel hidratada",
      "Los resultados mejoran en 3-6 meses"
    ]
  },

  "Luz Pulsada Intensa (IPL)": {
    title: "Luz Pulsada Intensa (IPL)",
    whatIs: "Tratamiento que utiliza pulsos de luz de amplio espectro para eliminar manchas, rojeces y mejorar la textura de la piel. La luz es absorbida por la melanina y hemoglobina, destruyendo células dañadas sin afectar la piel sana.",
    benefits: [
      "Eliminación de manchas y pecas",
      "Reducción de rojeces y vasos sanguíneos",
      "Mejora de la textura de la piel",
      "Estimulación de colágeno",
      "Piel más uniforme y clara",
      "Resultados progresivos"
    ],
    duration: "45-60 minutos",
    care: [
      "Evita el sol completamente por 2 semanas",
      "Usa protector solar SPF 70+",
      "Mantén la piel hidratada",
      "Evita maquillaje por 24 horas",
      "Evita productos irritantes por 3 días",
      "Repite sesiones cada 4-6 semanas"
    ]
  },

  "Mesoterapia Facial": {
    title: "Mesoterapia Facial",
    whatIs: "Inyección de vitaminas, minerales y nutrientes especializados en la capa media de la piel facial. Revitaliza, hidrata y rejuvenece el rostro desde adentro, mejorando la luminosidad y elasticidad.",
    benefits: [
      "Hidratación profunda de la piel",
      "Revitalización y luminosidad",
      "Mejora de la elasticidad",
      "Reducción de líneas finas",
      "Piel más suave y radiante",
      "Resultados visibles desde la primera sesión"
    ],
    duration: "45-60 minutos",
    care: [
      "Evita el sol directo por 48 horas",
      "Usa protector solar SPF 50+",
      "No hagas ejercicio intenso por 24 horas",
      "Mantén la piel hidratada",
      "Evita productos irritantes por 3 días",
      "Repite sesiones cada 2-4 semanas"
    ]
  },

  "Toxina Botulínica (Bótox)": {
    title: "Toxina Botulínica (Bótox)",
    whatIs: "Inyección de toxina botulínica purificada que relaja los músculos faciales responsables de las arrugas de expresión. Previene y suaviza líneas de expresión de forma natural y reversible, sin cambiar la expresión facial.",
    benefits: [
      "Suavizado de arrugas de expresión",
      "Prevención de nuevas arrugas",
      "Efecto lifting natural",
      "Resultados naturales",
      "Reversible",
      "Resultados visibles en 3-7 días"
    ],
    duration: "15-30 minutos",
    care: [
      "Evita tocar el área por 4 horas",
      "No hagas ejercicio intenso por 24 horas",
      "Evita el calor extremo por 48 horas",
      "Mantén la cabeza erguida",
      "Los resultados mejoran en 2 semanas",
      "Resultados duran 3-4 meses"
    ]
  },

  "Hollywood Peel": {
    title: "Hollywood Peel",
    whatIs: "Peeling avanzado que combina exfoliación profunda con ingredientes especializados. Proporciona limpieza profunda, luminosidad inmediata y rejuvenecimiento facial, ideal para preparar la piel para eventos especiales.",
    benefits: [
      "Piel luminosa y radiante",
      "Limpieza profunda de poros",
      "Eliminación de células muertas",
      "Mejora de la textura",
      "Brillo inmediato",
      "Efecto rejuvenecedor visible"
    ],
    duration: "60-90 minutos",
    care: [
      "Evita el sol por 48 horas",
      "Usa protector solar SPF 50+",
      "Mantén la piel hidratada",
      "Evita maquillaje por 24 horas",
      "Evita productos irritantes por 3 días",
      "Descamación ligera es normal"
    ]
  },

  // ═══ MEDICINA ESTÉTICA ═══
  "Relleno de Ácido Hialurónico (Russian Lips)": {
    title: "Relleno de Ácido Hialurónico (Russian Lips)",
    whatIs: "Inyección de ácido hialurónico de alta calidad en los labios para crear volumen, definición y forma. Técnica especial que crea labios más voluminosos, definidos y naturales con efecto 3D.",
    benefits: [
      "Labios más voluminosos y definidos",
      "Forma y contorno mejorados",
      "Efecto 3D natural",
      "Hidratación profunda",
      "Resultados inmediatos",
      "Reversible si es necesario"
    ],
    duration: "30-45 minutos",
    care: [
      "Evita tocar los labios por 4 horas",
      "No hagas ejercicio intenso por 24 horas",
      "Evita el calor extremo por 48 horas",
      "Usa protector labial SPF 50+",
      "Los resultados mejoran en 2 semanas",
      "Resultados duran 6-12 meses"
    ]
  },

  "Rellenos Faciales": {
    title: "Rellenos Faciales",
    whatIs: "Inyección de rellenos dérmicos (ácido hialurónico) en áreas específicas para restaurar volumen, suavizar arrugas y mejorar contornos faciales. Procedimiento mínimamente invasivo con resultados naturales.",
    benefits: [
      "Restauración de volumen facial",
      "Suavizado de arrugas y líneas de expresión",
      "Mejora de contornos faciales",
      "Labios más definidos y voluminosos",
      "Resultados naturales y reversibles",
      "Efecto rejuvenecedor inmediato"
    ],
    duration: "30-45 minutos",
    care: [
      "Evita tocar el área por 24 horas",
      "No hagas ejercicio intenso por 48 horas",
      "Evita el calor extremo (saunas, baños calientes)",
      "Usa protector solar SPF 50+",
      "Evita alcohol por 24 horas",
      "Los resultados mejoran en 2 semanas"
    ]
  },

  "Bioestimuladores de Colágeno": {
    title: "Bioestimuladores de Colágeno",
    whatIs: "Inyección de microesferas biocompatibles que estimulan la producción natural de colágeno del cuerpo. Proporciona resultados duraderos y naturales, mejorando la estructura y firmeza de la piel de forma progresiva.",
    benefits: [
      "Estimulación natural de colágeno",
      "Piel más firme y joven",
      "Resultados progresivos y duraderos",
      "Mejora de la textura",
      "Efecto lifting natural",
      "Resultados duran 2-3 años"
    ],
    duration: "30-45 minutos",
    care: [
      "Evita el sol directo por 2 semanas",
      "Usa protector solar SPF 70+",
      "No hagas ejercicio intenso por 48 horas",
      "Evita el calor extremo por 48 horas",
      "Mantén la piel hidratada",
      "Los resultados mejoran en 3-6 meses"
    ]
  },

  // ═══ OTROS ═══
  "Detox Iónico": {
    title: "Detox Iónico",
    whatIs: "Tratamiento desintoxicante que utiliza iones negativos para eliminar toxinas a través de los pies. Equilibra el pH corporal, mejora la circulación y proporciona una profunda limpieza interna de forma natural y no invasiva.",
    benefits: [
      "Eliminación de toxinas",
      "Equilibrio del pH corporal",
      "Mejora de la circulación",
      "Aumento de energía",
      "Mejor calidad del sueño",
      "Sensación general de bienestar"
    ],
    duration: "30-40 minutos",
    care: [
      "Bebe mucha agua después del tratamiento",
      "Descansa después de la sesión",
      "Evita alimentos pesados por 2 horas",
      "Repite cada 1-2 semanas",
      "Ideal como tratamiento complementario",
      "Máximo 2 sesiones por semana"
    ]
  },

  "Retiro de Tatuajes con Láser": {
    title: "Retiro de Tatuajes con Láser",
    whatIs: "Tecnología avanzada de láser que fragmenta el pigmento del tatuaje en partículas pequeñas que el cuerpo elimina naturalmente. Procedimiento seguro y efectivo que permite remover tatuajes de forma progresiva sin cicatrices.",
    benefits: [
      "Eliminación efectiva de tatuajes",
      "Mínimo riesgo de cicatrices",
      "Proceso seguro y controlado",
      "Resultados progresivos",
      "Tecnología de última generación",
      "Apto para todos los colores de tinta"
    ],
    duration: "15-45 minutos (según tamaño)",
    care: [
      "Evita el sol directo por 2 semanas",
      "Usa protector solar SPF 70+",
      "Mantén la zona limpia e hidratada",
      "Evita productos irritantes",
      "No rasques la zona tratada",
      "Sesiones cada 6-8 semanas"
    ]
  },

  "Productos Nutricionales y Cosméticos": {
    title: "Productos Nutricionales y Cosméticos",
    whatIs: "Línea completa de productos de alta calidad diseñados para complementar tus tratamientos. Incluye suplementos nutricionales, cosméticos profesionales y skincare que potencian los resultados de los procedimientos estéticos.",
    benefits: [
      "Complemento perfecto para tratamientos",
      "Productos de alta calidad",
      "Resultados potenciados",
      "Cuidado profesional en casa",
      "Ingredientes naturales y seguros",
      "Asesoramiento personalizado incluido"
    ],
    duration: "Consulta: 15-30 minutos",
    care: [
      "Sigue las instrucciones de uso",
      "Almacena en lugar fresco y seco",
      "Realiza prueba de sensibilidad primero",
      "Combina con rutina diaria",
      "Consulta con profesional si hay irritación",
      "Resultados visibles en 4-8 semanas"
    ]
  }
};
