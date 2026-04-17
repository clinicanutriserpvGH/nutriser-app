/**
 * Script para actualizar las descripciones detalladas de servicios
 * Usa mysql2 directamente para evitar problemas de importación de TypeScript
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Leer DATABASE_URL del proceso o del archivo .env
let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  try {
    const envPath = resolve(__dirname, "../.env");
    const envContent = readFileSync(envPath, "utf-8");
    const match = envContent.match(/DATABASE_URL=(.+)/);
    if (match) DATABASE_URL = match[1].trim();
  } catch {}
}

if (!DATABASE_URL) {
  console.error("DATABASE_URL no encontrado");
  process.exit(1);
}

const serviceData = [
  {
    name: "Asesoría Nutricional",
    description: "Consulta personalizada con nuestra nutrióloga certificada para diseñar un plan alimenticio adaptado a tus objetivos, estilo de vida y necesidades específicas. Evaluación completa de tu estado nutricional actual.",
    benefits: JSON.stringify(["Plan alimenticio 100% personalizado","Evaluación de composición corporal","Guía de hábitos alimenticios saludables","Seguimiento y ajuste del plan","Educación nutricional práctica","Resultados sostenibles a largo plazo"]),
    duration: "60 minutos",
    aftercare: JSON.stringify(["Sigue el plan alimenticio indicado","Registra tus comidas en el diario nutricional","Mantén hidratación adecuada (2L de agua al día)","Agenda tu seguimiento en 2-4 semanas","Consulta cualquier duda con tu nutrióloga","Realiza los análisis de laboratorio recomendados"])
  },
  {
    name: "Cavitación 80K y 120K",
    description: "Tratamiento no invasivo que utiliza ultrasonido de alta frecuencia para destruir células de grasa localizada. La energía ultrasónica rompe las membranas de las células adiposas, que son eliminadas naturalmente por el cuerpo.",
    benefits: JSON.stringify(["Elimina grasa localizada sin cirugía","Remodela y define la figura","Sin dolor ni tiempo de recuperación","Resultados visibles desde la primera sesión","Mejora la textura de la piel","Reduce la apariencia de celulitis"]),
    duration: "45-60 minutos",
    aftercare: JSON.stringify(["Bebe 2 litros de agua después del tratamiento","Evita alimentos grasos por 24 horas","Realiza actividad física ligera para ayudar a eliminar la grasa","No consumas alcohol por 48 horas","Programa sesiones con 72 horas de diferencia","Complementa con drenaje linfático para mejores resultados"])
  },
  {
    name: "Radiofrecuencia Corporal",
    description: "Tecnología que utiliza ondas de radiofrecuencia para calentar las capas profundas de la piel, estimulando la producción de colágeno y elastina. Reafirma, tensa y rejuvenece la piel del cuerpo de forma natural.",
    benefits: JSON.stringify(["Reafirma y tensa la piel flácida","Estimula la producción de colágeno","Mejora la elasticidad de la piel","Reduce la apariencia de celulitis","Resultados progresivos y naturales","Sin tiempo de recuperación"]),
    duration: "45-60 minutos",
    aftercare: JSON.stringify(["Mantén la piel hidratada con crema nutritiva","Bebe suficiente agua para potenciar resultados","Evita el sol directo por 48 horas","Usa protector solar SPF 50+ si expones el área","Evita baños muy calientes por 24 horas","Programa sesiones semanales para mejores resultados"])
  },
  {
    name: "Láser Lipolítico",
    description: "Tratamiento con láser de baja intensidad que penetra en la piel para actuar directamente sobre las células de grasa. Libera el contenido de las células adiposas para que sean metabolizadas por el cuerpo, reduciendo medidas de forma efectiva.",
    benefits: JSON.stringify(["Reduce medidas de forma efectiva","Actúa directamente sobre células de grasa","Sin cirugía ni recuperación","Mejora la circulación local","Resultados visibles desde las primeras sesiones","Ideal para zonas de difícil acceso"]),
    duration: "30-45 minutos",
    aftercare: JSON.stringify(["Realiza 30 minutos de ejercicio cardio después del tratamiento","Bebe abundante agua para ayudar a eliminar la grasa","Evita alimentos procesados y azúcares por 24 horas","No consumas alcohol por 48 horas","Complementa con masajes de drenaje linfático","Mantén una dieta equilibrada para potenciar resultados"])
  },
  {
    name: "Vacumterapia",
    description: "Técnica de masaje mecánico que utiliza succión controlada para movilizar tejidos, activar la circulación y el drenaje linfático. Combate la celulitis, mejora la textura de la piel y remodela la figura de forma natural.",
    benefits: JSON.stringify(["Reduce y mejora la apariencia de celulitis","Activa la circulación sanguínea y linfática","Remodela y define la silueta","Mejora la textura y firmeza de la piel","Reduce la retención de líquidos","Efecto relajante y descontracturante"]),
    duration: "45-60 minutos",
    aftercare: JSON.stringify(["Bebe abundante agua para potenciar el drenaje","Evita el sedentarismo: camina o haz ejercicio suave","Usa ropa cómoda y no ajustada después del tratamiento","Evita alimentos con alto contenido de sodio","Programa sesiones 2-3 veces por semana para mejores resultados","Complementa con una dieta baja en grasas saturadas"])
  },
  {
    name: "Martillo Vibrador Corporal",
    description: "Tratamiento de masaje mecánico con vibración profunda que trabaja sobre tejidos musculares y adiposos. Activa la circulación, rompe nódulos de celulitis y mejora la textura de la piel mediante percusión controlada.",
    benefits: JSON.stringify(["Rompe nódulos de celulitis profunda","Activa y mejora la circulación","Relaja la musculatura tensa","Mejora la textura de la piel","Reduce la retención de líquidos","Efecto descontracturante profundo"]),
    duration: "30-45 minutos",
    aftercare: JSON.stringify(["Bebe agua para ayudar a eliminar toxinas","Descansa si sientes sensibilidad en el área","Aplica crema hidratante o reductora en el área tratada","Evita ejercicio intenso por 24 horas si hay sensibilidad","Programa sesiones regulares para resultados óptimos"])
  },
  {
    name: "Vacuum con Copas para Glúteos",
    description: "Tratamiento especializado que utiliza succión con copas para levantar, tonificar y dar volumen a los glúteos de forma natural. Activa la circulación local, estimula la producción de colágeno y mejora la apariencia de la zona.",
    benefits: JSON.stringify(["Levanta y tonifica los glúteos","Aumenta el volumen de forma natural","Mejora la circulación en la zona","Estimula la producción de colágeno","Reduce la celulitis en glúteos y muslos","Sin cirugía ni implantes"]),
    duration: "45-60 minutos",
    aftercare: JSON.stringify(["Evita sentarte por períodos prolongados las primeras 2 horas","Usa ropa interior cómoda y no ajustada","Bebe agua para potenciar los resultados","Aplica crema reductora o reafirmante en el área","Programa sesiones 2-3 veces por semana","Complementa con ejercicios de glúteos para mejores resultados"])
  },
  {
    name: "Aplicación de Enzimas Reductoras",
    description: "Inyección de enzimas lipolíticas que actúan directamente sobre los depósitos de grasa localizada, descomponiéndolos para su eliminación natural. Tratamiento altamente efectivo para reducir medidas en zonas específicas.",
    benefits: JSON.stringify(["Elimina grasa localizada de forma efectiva","Resultados más rápidos que otros tratamientos","Actúa directamente en la zona problemática","Reduce medidas de forma notable","Mejora la textura de la piel","Tratamiento mínimamente invasivo"]),
    duration: "30-45 minutos",
    aftercare: JSON.stringify(["Bebe 2 litros de agua al día para ayudar a eliminar la grasa","Evita el sol directo en el área por 48 horas","No hagas ejercicio intenso por 24 horas","Aplica hielo si hay inflamación o sensibilidad","Evita masajes en el área por 24 horas","Programa sesiones cada 7-10 días"])
  },
  {
    name: "Mesoterapia Reductora",
    description: "Inyección de una mezcla de vitaminas, minerales y principios activos reductores en la capa media de la piel. Actúa sobre la grasa localizada, mejora la circulación y combate la celulitis desde adentro.",
    benefits: JSON.stringify(["Reduce grasa localizada y celulitis","Mejora la circulación y el drenaje linfático","Nutre y revitaliza la piel desde adentro","Resultados visibles desde las primeras sesiones","Tratamiento personalizado según necesidades","Mejora la textura y firmeza de la piel"]),
    duration: "30-45 minutos",
    aftercare: JSON.stringify(["Evita el sol directo en el área por 48 horas","No hagas ejercicio intenso por 24 horas","Bebe abundante agua para potenciar resultados","Aplica hielo si hay sensibilidad o inflamación","Evita baños muy calientes por 24 horas","Programa sesiones cada 7-14 días"])
  },
  {
    name: "Limpieza Facial Profunda",
    description: "Tratamiento facial completo que elimina impurezas, puntos negros y células muertas de la piel. Incluye limpieza, exfoliación, extracción, mascarilla y hidratación para una piel limpia, luminosa y saludable.",
    benefits: JSON.stringify(["Elimina impurezas y puntos negros","Piel más limpia y luminosa","Poros menos visibles","Mejora la textura de la piel","Hidratación profunda","Previene el acné y brotes"]),
    duration: "60-75 minutos",
    aftercare: JSON.stringify(["Evita el sol directo por 24 horas","Usa protector solar SPF 50+ al salir","No uses maquillaje por 12-24 horas","Mantén la piel hidratada con crema suave","Evita productos con ácidos o retinol por 48 horas","No toques ni frotes el área tratada"])
  },
  {
    name: "Radiofrecuencia Facial",
    description: "Tratamiento antiedad que utiliza ondas de radiofrecuencia para calentar las capas profundas de la piel facial, estimulando la producción de colágeno. Reafirma, tensa y rejuvenece el rostro de forma natural y progresiva.",
    benefits: JSON.stringify(["Reafirma y tensa la piel facial","Estimula la producción de colágeno","Reduce arrugas y líneas de expresión","Efecto lifting natural sin cirugía","Mejora el óvalo facial","Resultados progresivos y duraderos"]),
    duration: "45-60 minutos",
    aftercare: JSON.stringify(["Evita el sol directo por 48 horas","Usa protector solar SPF 50+ diariamente","Mantén la piel hidratada con crema nutritiva","Evita productos irritantes por 24 horas","No hagas ejercicio intenso por 24 horas","Programa sesiones semanales para mejores resultados"])
  },
  {
    name: "Hollywood Peel",
    description: "Tratamiento facial con láser de carbón que limpia profundamente los poros, elimina impurezas y estimula la renovación celular. Conocido como el 'peeling de las celebridades', deja la piel brillante, uniforme y rejuvenecida.",
    benefits: JSON.stringify(["Piel instantáneamente luminosa y radiante","Limpieza profunda de poros","Eliminación de manchas y tono desigual","Estimula la renovación celular","Reduce la apariencia de poros dilatados","Sin tiempo de recuperación"]),
    duration: "45-60 minutos",
    aftercare: JSON.stringify(["Evita el sol directo por 48 horas obligatoriamente","Usa protector solar SPF 50+ al salir","No uses maquillaje por 24 horas","Mantén la piel hidratada con crema suave","Evita productos con ácidos por 72 horas","Repite el tratamiento cada 3-4 semanas"])
  },
  {
    name: "Plasma Rico en Plaquetas (PRP Facial)",
    description: "Tratamiento de regeneración celular que utiliza las propias plaquetas del paciente para estimular la producción de colágeno y elastina. El plasma rico en factores de crecimiento rejuvenece y revitaliza la piel de forma natural.",
    benefits: JSON.stringify(["Regenera y rejuvenece la piel naturalmente","Estimula la producción de colágeno y elastina","Mejora la textura y luminosidad","Reduce arrugas y líneas finas","Tratamiento 100% natural con tus propias células","Resultados progresivos y duraderos"]),
    duration: "60-75 minutos",
    aftercare: JSON.stringify(["Evita el sol directo por 72 horas","Usa protector solar SPF 50+ diariamente","No uses maquillaje por 24-48 horas","Mantén la piel hidratada","Evita ejercicio intenso por 24 horas","Los resultados mejoran progresivamente en 4-6 semanas"])
  },
  {
    name: "Mesoterapia Facial",
    description: "Inyección de vitaminas, minerales y nutrientes especializados en la capa media de la piel facial. Revitaliza, hidrata y rejuvenece el rostro desde adentro, mejorando la luminosidad y elasticidad de forma visible.",
    benefits: JSON.stringify(["Hidratación profunda de la piel","Revitalización y luminosidad inmediata","Mejora de la elasticidad","Reducción de líneas finas","Piel más suave y radiante","Resultados visibles desde la primera sesión"]),
    duration: "45-60 minutos",
    aftercare: JSON.stringify(["Evita el sol directo por 48 horas","Usa protector solar SPF 50+","No hagas ejercicio intenso por 24 horas","Mantén la piel hidratada","Evita productos irritantes por 3 días","Repite sesiones cada 2-4 semanas"])
  },
  {
    name: "Toxina Botulínica (Bótox)",
    description: "Inyección de toxina botulínica purificada que relaja los músculos faciales responsables de las arrugas de expresión. Previene y suaviza líneas de expresión de forma natural y reversible, sin cambiar la expresión facial.",
    benefits: JSON.stringify(["Suavizado de arrugas de expresión","Prevención de nuevas arrugas","Efecto lifting natural","Resultados naturales y reversibles","Resultados visibles en 3-7 días","Duración de 3-4 meses"]),
    duration: "15-30 minutos",
    aftercare: JSON.stringify(["Evita tocar el área por 4 horas","No hagas ejercicio intenso por 24 horas","Evita el calor extremo por 48 horas","Mantén la cabeza erguida las primeras 4 horas","Los resultados mejoran progresivamente en 2 semanas","Programa tu retoque a los 3-4 meses"])
  },
  {
    name: "Relleno de Ácido Hialurónico (Russian Lips)",
    description: "Inyección de ácido hialurónico de alta calidad en los labios para crear volumen, definición y forma. Técnica especial Russian Lips que crea labios más voluminosos, definidos y naturales con efecto 3D sin aspecto artificial.",
    benefits: JSON.stringify(["Labios más voluminosos y definidos","Forma y contorno mejorados con efecto 3D","Hidratación profunda de los labios","Resultados inmediatos y naturales","Reversible si es necesario","Duración de 6-12 meses"]),
    duration: "30-45 minutos",
    aftercare: JSON.stringify(["Evita tocar los labios por 4 horas","No hagas ejercicio intenso por 24 horas","Evita el calor extremo por 48 horas","Usa protector labial SPF 50+","Aplica hielo si hay inflamación","Los resultados se asientan en 2 semanas"])
  },
  {
    name: "Rellenos Faciales",
    description: "Inyección de rellenos dérmicos de ácido hialurónico en áreas específicas para restaurar volumen, suavizar arrugas y mejorar contornos faciales. Procedimiento mínimamente invasivo con resultados naturales e inmediatos.",
    benefits: JSON.stringify(["Restauración de volumen facial perdido","Suavizado de arrugas y líneas profundas","Mejora de contornos faciales","Resultados inmediatos y naturales","Reversibles si es necesario","Duración de 12-18 meses"]),
    duration: "30-45 minutos",
    aftercare: JSON.stringify(["Evita tocar el área por 24 horas","No hagas ejercicio intenso por 48 horas","Evita el calor extremo (saunas, baños calientes)","Usa protector solar SPF 50+","Evita alcohol por 24 horas","Los resultados se asientan en 2 semanas"])
  },
  {
    name: "Bioestimuladores de Colágeno",
    description: "Inyección de sustancias bioestimulantes que activan la producción natural de colágeno en la piel. Rejuvenece y reafirma de forma progresiva y natural, mejorando la calidad, firmeza y elasticidad de la piel desde adentro.",
    benefits: JSON.stringify(["Estimulación natural de colágeno propio","Piel más firme, joven y radiante","Mejora progresiva de la elasticidad","Reducción de arrugas y flacidez","Resultados naturales y duraderos","Duración de 12-18 meses"]),
    duration: "45-60 minutos",
    aftercare: JSON.stringify(["Evita el sol directo por 48 horas","Usa protector solar SPF 50+ diariamente","Mantén la piel hidratada","No hagas ejercicio intenso por 24 horas","Los resultados mejoran progresivamente en 2-3 meses","Programa sesiones de mantenimiento cada 12-18 meses"])
  },
  {
    name: "Detox Iónico",
    description: "Tratamiento desintoxicante que utiliza iones negativos para eliminar toxinas a través de los pies mediante un baño de agua ionizada. Equilibra el pH corporal, mejora la circulación y proporciona una profunda limpieza interna de forma natural.",
    benefits: JSON.stringify(["Eliminación de toxinas acumuladas","Equilibrio del pH corporal","Mejora de la circulación","Aumento de energía y vitalidad","Mejor calidad del sueño","Sensación general de bienestar"]),
    duration: "30-40 minutos",
    aftercare: JSON.stringify(["Bebe mucha agua después del tratamiento","Descansa y evita actividad intensa por 2 horas","Evita alimentos pesados por 2 horas","Repite cada 1-2 semanas para mejores resultados","Ideal como tratamiento complementario","Máximo 2 sesiones por semana"])
  },
  {
    name: "Retiro de Tatuajes con Láser",
    description: "Tecnología avanzada de láser Q-Switch que fragmenta las partículas de tinta del tatuaje en pequeñas partículas que el cuerpo elimina naturalmente. Tratamiento progresivo y seguro para eliminar tatuajes de cualquier color y tamaño.",
    benefits: JSON.stringify(["Eliminación progresiva y segura del tatuaje","Tecnología láser Q-Switch de última generación","Mínimo daño a la piel circundante","Efectivo en múltiples colores de tinta","Resultados visibles desde la primera sesión","Tratamiento personalizado según el tatuaje"]),
    duration: "15-60 minutos según tamaño | Programa de 6-12 sesiones",
    aftercare: JSON.stringify(["Evita el sol directo en el área por 4 semanas","Usa protector solar SPF 50+ en el área tratada","Mantén la piel hidratada con crema suave","No rasques ni frotes el área tratada","Evita agua caliente en el área por 48 horas","Espera 6-8 semanas entre sesiones"])
  }
];

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log("Conectado a la base de datos");
  console.log("Actualizando descripciones de servicios...\n");
  
  let updated = 0;
  let notFound = 0;

  for (const svc of serviceData) {
    try {
      const [result] = await connection.execute(
        `UPDATE services SET description = ?, benefits = ?, duration = ?, aftercare = ?, updatedAt = NOW() WHERE name = ?`,
        [svc.description, svc.benefits, svc.duration, svc.aftercare, svc.name]
      );
      if (result.affectedRows > 0) {
        console.log(`✓ ${svc.name}`);
        updated++;
      } else {
        console.log(`⚠ No encontrado: ${svc.name}`);
        notFound++;
      }
    } catch (err) {
      console.error(`✗ Error en ${svc.name}:`, err.message);
    }
  }

  await connection.end();
  console.log(`\n✅ Completado: ${updated} actualizados, ${notFound} no encontrados`);
}

main().catch(console.error);
