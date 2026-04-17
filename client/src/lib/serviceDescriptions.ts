/**
 * Descripciones detalladas de servicios para la página /servicios
 * Cada servicio incluye: qué es, beneficios, duración, cuidados
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

  "Plan de Pérdida de Peso": {
    title: "Plan de Pérdida de Peso",
    whatIs: "Programa integral de pérdida de peso que combina evaluación nutricional, plan alimenticio personalizado, seguimiento médico y asesoramiento en cambios de hábitos. Diseñado para lograr resultados sostenibles y saludables.",
    benefits: [
      "Pérdida de peso efectiva y duradera",
      "Aumento de autoestima y confianza",
      "Mejora de la salud cardiovascular",
      "Reducción de presión arterial y glucosa",
      "Mayor energía y vitalidad",
      "Hábitos alimenticios saludables de por vida"
    ],
    duration: "Programa de 12 semanas con seguimiento semanal",
    care: [
      "Cumple con el plan alimenticio establecido",
      "Realiza actividad física moderada (30 min diarios)",
      "Duerme 7-8 horas diarias",
      "Evita alimentos ultraprocesados",
      "Asiste a todas las citas de seguimiento",
      "Reporta cambios en tu peso y medidas"
    ]
  },

  "Evaluación Nutricional Completa": {
    title: "Evaluación Nutricional Completa",
    whatIs: "Análisis exhaustivo del estado nutricional que incluye mediciones antropométricas, evaluación de composición corporal, análisis de hábitos alimenticios y recomendaciones específicas basadas en tus necesidades individuales.",
    benefits: [
      "Diagnóstico preciso de tu estado nutricional",
      "Identificación de deficiencias nutricionales",
      "Recomendaciones personalizadas",
      "Base para programas de salud efectivos",
      "Monitoreo del progreso",
      "Prevención de problemas de salud"
    ],
    duration: "60-90 minutos",
    care: [
      "Llega en ayunas si es posible",
      "Trae registro de lo que comiste en los últimos 3 días",
      "Viste ropa cómoda para mediciones",
      "Comunica cualquier alergia o intolerancia alimentaria",
      "Anota preguntas antes de la cita"
    ]
  },

  "Suplementación Nutricional": {
    title: "Suplementación Nutricional",
    whatIs: "Recomendación y prescripción de suplementos nutricionales específicos basados en evaluación de deficiencias. Incluye vitaminas, minerales, probióticos y otros suplementos de calidad farmacéutica.",
    benefits: [
      "Corrección de deficiencias nutricionales",
      "Mejora de inmunidad",
      "Mayor energía y vitalidad",
      "Mejor absorción de nutrientes",
      "Apoyo en objetivos de salud",
      "Productos de calidad garantizada"
    ],
    duration: "Consulta: 30-45 minutos",
    care: [
      "Toma los suplementos según indicaciones",
      "Mantén consistencia en la toma",
      "Comunica cualquier efecto secundario",
      "Almacena en lugar fresco y seco",
      "No suspendas sin consultar al nutriólogo"
    ]
  },

  // ═══ FACIALES ═══
  "Hollywood Peel": {
    title: "Hollywood Peel",
    whatIs: "Peeling químico superficial con ácidos suaves que exfolia la capa externa de la piel, eliminando células muertas y estimulando la renovación celular. Ideal para mejorar luminosidad y textura sin tiempo de recuperación.",
    benefits: [
      "Piel más luminosa e hidratada",
      "Textura suave y uniforme",
      "Reducción de manchas superficiales",
      "Estimulación de colágeno",
      "Sin tiempo de inactividad",
      "Resultados inmediatos"
    ],
    duration: "30-45 minutos",
    care: [
      "Evita el sol directo por 48 horas",
      "Usa protector solar SPF 50+ diariamente",
      "No uses productos ácidos por 3 días",
      "Mantén la piel hidratada",
      "Evita maquillaje por 24 horas si es posible",
      "Aplica crema hidratante 2-3 veces al día"
    ]
  },

  "Limpieza Facial Profunda": {
    title: "Limpieza Facial Profunda",
    whatIs: "Tratamiento facial completo que incluye limpieza profunda, exfoliación, extracción de comedones, masaje facial y aplicación de mascarilla según tipo de piel. Elimina impurezas y prepara la piel para otros tratamientos.",
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
      "Realiza sesiones cada 2-4 semanas para mejores resultados"
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
      "Evita tocar el área tratada por 24 horas",
      "No hagas ejercicio intenso por 48 horas",
      "Evita el calor extremo (saunas, baños calientes)",
      "Usa protector solar SPF 50+",
      "Evita alcohol por 24 horas",
      "Los resultados mejoran en 2 semanas"
    ]
  },

  "Mesoterapia Facial": {
    title: "Mesoterapia Facial",
    whatIs: "Técnica que inyecta microgotas de vitaminas, minerales y ácido hialurónico en la capa media de la piel. Hidrata profundamente, rejuvenece y mejora la calidad de la piel desde adentro.",
    benefits: [
      "Hidratación profunda y duradera",
      "Piel más luminosa y radiante",
      "Mejora de la elasticidad",
      "Reducción de arrugas finas",
      "Efecto antienvejecimiento",
      "Resultados visibles desde la primera sesión"
    ],
    duration: "45-60 minutos",
    care: [
      "Evita el sol directo por 48 horas",
      "Usa protector solar SPF 50+",
      "No hagas ejercicio intenso por 24 horas",
      "Mantén la piel hidratada",
      "Evita productos irritantes por 3 días",
      "Realiza sesiones cada 2-3 semanas"
    ]
  },

  "Tratamiento de Acné": {
    title: "Tratamiento de Acné",
    whatIs: "Protocolo integral para el acné que combina limpieza profunda, tratamientos específicos, recomendaciones nutricionales y seguimiento profesional. Dirigido a controlar el acné activo y prevenir cicatrices.",
    benefits: [
      "Control del acné activo",
      "Reducción de inflamación",
      "Prevención de nuevas lesiones",
      "Prevención de cicatrices",
      "Piel más clara y saludable",
      "Mejora de la autoestima"
    ],
    duration: "Sesiones de 45-60 minutos | Programa de 8-12 semanas",
    care: [
      "Sigue la rutina de limpieza recomendada",
      "Usa protector solar diariamente",
      "Evita tocar tu cara",
      "No exprimas espinillas",
      "Mantén la piel hidratada",
      "Sigue el plan nutricional recomendado"
    ]
  },

  "Tratamiento de Cicatrices de Acné": {
    title: "Tratamiento de Cicatrices de Acné",
    whatIs: "Tratamiento especializado para reducir la apariencia de cicatrices dejadas por acné. Utiliza tecnología avanzada como radiofrecuencia, microagujas y peelings para estimular regeneración de colágeno.",
    benefits: [
      "Reducción visible de cicatrices",
      "Mejora de la textura de la piel",
      "Piel más uniforme",
      "Estimulación de colágeno",
      "Resultados progresivos",
      "Mayor confianza"
    ],
    duration: "45-60 minutos por sesión | Programa de 6-8 sesiones",
    care: [
      "Usa protector solar SPF 50+ diariamente",
      "Evita el sol directo por 48 horas",
      "Mantén la piel hidratada",
      "Evita productos irritantes",
      "No exfolies por 3 días",
      "Sigue el programa completo para mejores resultados"
    ]
  },

  "Microagujas": {
    title: "Microagujas (Microneedling)",
    whatIs: "Tratamiento que utiliza microagujas para crear microlesiones controladas en la piel, estimulando la producción natural de colágeno y elastina. Mejora la textura, cicatrices y signos de envejecimiento.",
    benefits: [
      "Estimulación de colágeno natural",
      "Mejora de cicatrices y textura",
      "Reducción de arrugas",
      "Piel más firme y radiante",
      "Absorción mejorada de productos",
      "Resultados duraderos"
    ],
    duration: "60-90 minutos",
    care: [
      "Evita el sol directo por 48 horas",
      "Usa protector solar SPF 50+",
      "No hagas ejercicio intenso por 24 horas",
      "Evita maquillaje por 24 horas",
      "Mantén la piel hidratada",
      "Evita productos ácidos por 3 días"
    ]
  },

  "Tratamiento de Hiperpigmentación": {
    title: "Tratamiento de Hiperpigmentación",
    whatIs: "Protocolo especializado para manchas oscuras y decoloraciones de la piel. Combina peelings químicos, radiofrecuencia y productos despigmentantes para restaurar uniformidad del tono.",
    benefits: [
      "Reducción de manchas oscuras",
      "Tono de piel más uniforme",
      "Piel más clara y radiante",
      "Prevención de nuevas manchas",
      "Resultados visibles",
      "Mejor apariencia general"
    ],
    duration: "45-60 minutos por sesión | Programa de 4-6 sesiones",
    care: [
      "Usa protector solar SPF 50+ diariamente",
      "Evita el sol directo",
      "Aplica crema despigmentante según indicaciones",
      "Mantén la piel hidratada",
      "Evita productos irritantes",
      "Completa el programa para mejores resultados"
    ]
  },

  // ═══ CORPORALES ═══
  "Tratamiento de Estrías": {
    title: "Tratamiento de Estrías",
    whatIs: "Tratamiento avanzado que reduce la apariencia de estrías blancas y rojas. Utiliza radiofrecuencia, microagujas y peelings para estimular colágeno y mejorar la textura de la piel afectada.",
    benefits: [
      "Reducción visible de estrías",
      "Mejora de la textura",
      "Estimulación de colágeno",
      "Piel más uniforme",
      "Mayor confianza",
      "Resultados progresivos"
    ],
    duration: "45-60 minutos por sesión | Programa de 6-8 sesiones",
    care: [
      "Mantén la piel hidratada constantemente",
      "Usa crema hidratante 2-3 veces al día",
      "Evita el sol directo por 48 horas",
      "Usa protector solar SPF 50+",
      "No exfolies por 3 días",
      "Completa el programa para mejores resultados"
    ]
  },

  "Tratamiento de Celulitis": {
    title: "Tratamiento de Celulitis",
    whatIs: "Protocolo integral para reducir la celulitis que combina radiofrecuencia, drenaje linfático, masajes especializados y recomendaciones nutricionales. Mejora la circulación y la apariencia de la piel.",
    benefits: [
      "Reducción visible de celulitis",
      "Mejora de la circulación",
      "Piel más lisa y uniforme",
      "Estimulación de drenaje linfático",
      "Efecto reafirmante",
      "Resultados duraderos"
    ],
    duration: "60-90 minutos por sesión | Programa de 8-10 sesiones",
    care: [
      "Bebe mucha agua (2-3 litros diarios)",
      "Realiza actividad física moderada",
      "Mantén la piel hidratada",
      "Sigue el plan nutricional recomendado",
      "Evita alimentos ultraprocesados",
      "Completa el programa para mejores resultados"
    ]
  },

  "Liposucción No Invasiva": {
    title: "Liposucción No Invasiva",
    whatIs: "Tratamiento no quirúrgico que utiliza radiofrecuencia y cavitación ultrasónica para reducir depósitos de grasa localizada. Estimula el metabolismo y favorece la eliminación natural de grasas.",
    benefits: [
      "Reducción de grasa localizada",
      "Contornos más definidos",
      "Sin cirugía ni tiempo de recuperación",
      "Estimulación del metabolismo",
      "Resultados naturales",
      "Mejora de la silueta"
    ],
    duration: "60-90 minutos por sesión | Programa de 6-8 sesiones",
    care: [
      "Bebe mucha agua después del tratamiento",
      "Realiza actividad física moderada",
      "Sigue el plan nutricional recomendado",
      "Evita alimentos grasosos",
      "Mantén la piel hidratada",
      "Completa el programa para mejores resultados"
    ]
  },

  "Drenaje Linfático": {
    title: "Drenaje Linfático",
    whatIs: "Masaje terapéutico especializado que estimula el sistema linfático para mejorar la circulación, reducir hinchazón y eliminar toxinas. Técnica suave pero efectiva para desintoxicación corporal.",
    benefits: [
      "Reducción de hinchazón y retención de líquidos",
      "Mejora de la circulación",
      "Eliminación de toxinas",
      "Alivio de pesadez",
      "Efecto desintoxicante",
      "Sensación de ligereza"
    ],
    duration: "60-90 minutos",
    care: [
      "Bebe mucha agua después del tratamiento",
      "Descansa por lo menos 30 minutos",
      "Evita alimentos muy salados",
      "Mantente hidratado",
      "Realiza actividad física moderada",
      "Repite sesiones cada 2-3 semanas"
    ]
  },

  "Masaje Reductivo": {
    title: "Masaje Reductivo",
    whatIs: "Masaje especializado que combina técnicas de drenaje linfático, presión profunda y movimientos específicos para mejorar la circulación, reducir medidas y favorecer la eliminación de grasa.",
    benefits: [
      "Reducción de medidas",
      "Mejora de la circulación",
      "Estimulación del metabolismo",
      "Reducción de celulitis",
      "Piel más firme",
      "Sensación de bienestar"
    ],
    duration: "60-90 minutos",
    care: [
      "Bebe mucha agua después del tratamiento",
      "Evita comidas pesadas por 2 horas",
      "Realiza actividad física moderada",
      "Mantén la piel hidratada",
      "Sigue plan nutricional recomendado",
      "Repite sesiones cada 2 semanas"
    ]
  },

  // ═══ MEDICINA ESTÉTICA ═══
  "Botox": {
    title: "Botox",
    whatIs: "Inyección de toxina botulínica purificada que relaja los músculos faciales responsables de las arrugas de expresión. Previene y suaviza líneas de expresión de forma natural y reversible.",
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

  "Peeling Químico Profundo": {
    title: "Peeling Químico Profundo",
    whatIs: "Peeling químico con ácidos más concentrados que penetra capas más profundas de la piel. Elimina daño solar, cicatrices y manchas para una renovación completa de la piel.",
    benefits: [
      "Renovación profunda de la piel",
      "Eliminación de daño solar",
      "Reducción de cicatrices",
      "Eliminación de manchas",
      "Piel más lisa y radiante",
      "Estimulación de colágeno"
    ],
    duration: "60-90 minutos",
    care: [
      "Evita el sol completamente por 2 semanas",
      "Usa protector solar SPF 70+ diariamente",
      "Mantén la piel muy hidratada",
      "Evita maquillaje por 48 horas",
      "Evita productos irritantes por 1 semana",
      "Descamación es normal (3-7 días)"
    ]
  },

  "Tratamiento Antienvejecimiento": {
    title: "Tratamiento Antienvejecimiento",
    whatIs: "Protocolo integral que combina múltiples tecnologías y tratamientos para combatir signos de envejecimiento. Incluye radiofrecuencia, peelings, hidratación profunda y recomendaciones nutricionales.",
    benefits: [
      "Reducción de arrugas y líneas finas",
      "Piel más firme y reafirmada",
      "Mejora de la elasticidad",
      "Piel más luminosa",
      "Efecto rejuvenecedor integral",
      "Resultados duraderos"
    ],
    duration: "90-120 minutos por sesión | Programa de 6-8 sesiones",
    care: [
      "Usa protector solar SPF 50+ diariamente",
      "Mantén la piel hidratada",
      "Duerme 7-8 horas diarias",
      "Realiza actividad física moderada",
      "Sigue plan nutricional antienvejecimiento",
      "Completa el programa para mejores resultados"
    ]
  },

  "Escáner Corporal": {
    title: "Escáner Corporal",
    whatIs: "Análisis de composición corporal utilizando tecnología de bioimpedancia. Mide porcentaje de grasa, masa muscular, agua corporal y otros parámetros para evaluación completa de la salud.",
    benefits: [
      "Análisis preciso de composición corporal",
      "Monitoreo del progreso",
      "Identificación de áreas a mejorar",
      "Base para programas personalizados",
      "Motivación con datos reales",
      "Seguimiento objetivo"
    ],
    duration: "15-20 minutos",
    care: [
      "Llega hidratado",
      "Evita ejercicio intenso 2 horas antes",
      "Usa ropa cómoda",
      "Comunica medicamentos que tomes",
      "Repite cada 4 semanas para monitoreo"
    ]
  },

  "Consulta Médica Estética": {
    title: "Consulta Médica Estética",
    whatIs: "Consulta con médico especialista en estética para evaluar tus necesidades, objetivos y opciones de tratamiento. Se diseña un plan personalizado basado en tu tipo de piel, edad y expectativas.",
    benefits: [
      "Evaluación profesional completa",
      "Plan de tratamiento personalizado",
      "Recomendaciones basadas en tu caso",
      "Resolución de dudas",
      "Seguimiento profesional",
      "Resultados optimizados"
    ],
    duration: "45-60 minutos",
    care: [
      "Trae fotos de referencia si deseas",
      "Comunica alergias y medicamentos",
      "Sé honesto sobre tus expectativas",
      "Sigue las recomendaciones del médico",
      "Asiste a seguimientos programados"
    ]
  }
};

export type ServiceKey = keyof typeof serviceDescriptions;
