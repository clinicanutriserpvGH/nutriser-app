import { useEffect } from 'react';
import { MapPin, Phone, Clock, DollarSign, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface ServicePageProps {
  serviceId: string;
}

const SERVICES = {
  nutriologo: {
    title: 'Nutriólogo en Puerto Vallarta | Nutriser',
    h1: 'Nutriólogo en Puerto Vallarta',
    description: 'Consulta con nutriólogo profesional en Puerto Vallarta. Planes personalizados de nutrición y dieta. Ubicado en Valentín Gómez Farías, Jalisco.',
    content: {
      intro: 'En Nutriser contamos con nutriólogos certificados especializados en nutrición clínica, deportiva y estética. Nuestros profesionales diseñan planes personalizados adaptados a tus objetivos de salud y bienestar.',
      whatIs: 'Un nutriólogo es un profesional de la salud especializado en nutrición que evalúa tu estado nutricional, hábitos alimenticios y objetivos para crear un plan de alimentación personalizado que mejore tu salud, energía y composición corporal.',
      forWho: 'Ideal para personas que desean perder peso, ganar masa muscular, mejorar su energía, controlar enfermedades crónicas o simplemente llevar una alimentación más saludable y equilibrada.',
      benefits: [
        'Plan de alimentación personalizado según tus objetivos',
        'Seguimiento mensual de tu progreso',
        'Recomendaciones de suplementos si es necesario',
        'Educación nutricional para cambios duraderos',
        'Adaptación de la dieta a tu estilo de vida'
      ],
      duration: '60 minutos la primera consulta, 30 minutos las siguientes',
      care: 'Sigue el plan de alimentación recomendado, mantente hidratado, registra tus comidas en tu app de seguimiento, asiste a tus citas de control mensuales.',
      price: 'Consulta inicial: $800 MXN | Seguimiento: $500 MXN',
      location: 'Clínica Nutriser, Emiliano Zapata 2, Valentín Gómez Farías, Puerto Vallarta, Jalisco',
      schedule: 'Lunes a viernes: 9:00 AM - 6:00 PM | Sábados: 10:00 AM - 2:00 PM'
    }
  },
  hollywood_peel: {
    title: 'Hollywood Peel en Puerto Vallarta | Tratamiento Facial',
    h1: 'Hollywood Peel en Puerto Vallarta',
    description: 'Hollywood Peel profesional en Puerto Vallarta. Rejuvenecimiento facial sin cirugía. Resultados visibles desde la primera sesión.',
    content: {
      intro: 'El Hollywood Peel es un tratamiento de rejuvenecimiento facial no invasivo que utiliza ácidos suaves para remover las capas superficiales de la piel, revelando una piel más joven, luminosa y uniforme.',
      whatIs: 'Es un peeling químico suave que combina ácidos naturales para exfoliar la piel de manera controlada, eliminando células muertas, manchas y líneas de expresión superficiales.',
      forWho: 'Perfecto para personas que desean mejorar la textura de su piel, eliminar manchas, reducir líneas finas, acné residual o simplemente rejuvenecer su rostro sin cirugía.',
      benefits: [
        'Piel más luminosa y radiante',
        'Reducción de manchas y pecas',
        'Minimiza poros dilatados',
        'Suaviza líneas finas de expresión',
        'Mejora la textura general de la piel',
        'Sin tiempo de recuperación'
      ],
      duration: '30-45 minutos',
      care: 'Usa protector solar diariamente (SPF 50+), evita el sol directo por 48 horas, mantén la piel hidratada, no uses productos irritantes por 3 días.',
      price: 'Sesión única: $1,200 MXN | Paquete 3 sesiones: $3,200 MXN',
      location: 'Clínica Nutriser, Emiliano Zapata 2, Valentín Gómez Farías, Puerto Vallarta, Jalisco',
      schedule: 'Lunes a viernes: 9:00 AM - 6:00 PM | Sábados: 10:00 AM - 2:00 PM'
    }
  },
  limpieza_facial: {
    title: 'Limpieza Facial Profunda en Puerto Vallarta | Nutriser',
    h1: 'Limpieza Facial Profunda en Puerto Vallarta',
    description: 'Limpieza facial profunda profesional en Puerto Vallarta. Elimina impurezas y rejuvenece tu piel. Tratamiento completo con resultados inmediatos.',
    content: {
      intro: 'Nuestra limpieza facial profunda es un tratamiento completo que incluye extracción de comedones, hidratación intensiva y aplicación de mascarillas específicas para tu tipo de piel.',
      whatIs: 'Es un tratamiento facial profundo que limpia poros, elimina puntos negros y blancos, exfolia suavemente y aplica productos hidratantes y nutritivos para dejar la piel fresca y luminosa.',
      forWho: 'Recomendado para todo tipo de piel, especialmente para pieles grasas, mixtas o con acné. Ideal como mantenimiento mensual o como preparación antes de otros tratamientos.',
      benefits: [
        'Poros más limpios y cerrados',
        'Eliminación de puntos negros y blancos',
        'Piel más suave y uniforme',
        'Mejor absorción de productos posteriores',
        'Efecto rejuvenecedor inmediato',
        'Previene futuros brotes de acné'
      ],
      duration: '60 minutos',
      care: 'Evita maquillaje por 24 horas, usa protector solar, mantén la piel hidratada, evita productos muy fuertes por 3 días.',
      price: 'Sesión única: $600 MXN | Paquete mensual (4 sesiones): $2,000 MXN',
      location: 'Clínica Nutriser, Emiliano Zapata 2, Valentín Gómez Farías, Puerto Vallarta, Jalisco',
      schedule: 'Lunes a viernes: 9:00 AM - 6:00 PM | Sábados: 10:00 AM - 2:00 PM'
    }
  },
  mesoterapia: {
    title: 'Mesoterapia Corporal en Puerto Vallarta | Nutriser',
    h1: 'Mesoterapia Corporal en Puerto Vallarta',
    description: 'Mesoterapia corporal en Puerto Vallarta para reducir celulitis y flacidez. Tratamiento no invasivo con resultados progresivos.',
    content: {
      intro: 'La mesoterapia corporal es un tratamiento que inyecta micronutrientes, vitaminas y sustancias reductoras en las capas medias de la piel para combatir celulitis, flacidez y mejorar la circulación.',
      whatIs: 'Es un tratamiento que utiliza microinyecciones de sustancias naturales para estimular la circulación, quemar grasas localizadas y mejorar la firmeza de la piel en zonas como abdomen, glúteos y muslos.',
      forWho: 'Ideal para personas que desean reducir celulitis, flacidez, grasa localizada o mejorar la apariencia de su cuerpo sin cirugía. Excelente como complemento a dieta y ejercicio.',
      benefits: [
        'Reduce celulitis notoriamente',
        'Mejora la firmeza de la piel',
        'Reduce medidas localizadas',
        'Estimula la circulación',
        'Resultados progresivos y naturales',
        'Sin cicatrices ni tiempo de recuperación'
      ],
      duration: '45-60 minutos',
      care: 'Evita el ejercicio intenso por 48 horas, mantente hidratado, masajea la zona tratada suavemente, usa ropa cómoda, evita el calor excesivo.',
      price: 'Sesión única: $1,500 MXN | Paquete 6 sesiones: $7,500 MXN',
      location: 'Clínica Nutriser, Emiliano Zapata 2, Valentín Gómez Farías, Puerto Vallarta, Jalisco',
      schedule: 'Lunes a viernes: 9:00 AM - 6:00 PM | Sábados: 10:00 AM - 2:00 PM'
    }
  },
  radiofrecuencia: {
    title: 'Radiofrecuencia Facial en Puerto Vallarta | Nutriser',
    h1: 'Radiofrecuencia Facial en Puerto Vallarta',
    description: 'Radiofrecuencia facial en Puerto Vallarta. Rejuvenecimiento sin cirugía. Estimula colágeno y tensa la piel naturalmente.',
    content: {
      intro: 'La radiofrecuencia facial es un tratamiento que utiliza energía térmica controlada para estimular la producción de colágeno, mejorando la firmeza, elasticidad y luminosidad de la piel.',
      whatIs: 'Es una tecnología que emite ondas de radiofrecuencia que calientan las capas profundas de la piel, estimulando la síntesis de colágeno y elastina para un efecto lifting natural.',
      forWho: 'Perfecto para personas con flacidez leve a moderada, líneas de expresión, pérdida de luminosidad o que desean prevenir el envejecimiento sin cirugía.',
      benefits: [
        'Efecto lifting natural sin cirugía',
        'Mejora la firmeza y elasticidad',
        'Reduce líneas y arrugas',
        'Piel más luminosa y rejuvenecida',
        'Resultados progresivos',
        'Sin efectos secundarios'
      ],
      duration: '30-45 minutos',
      care: 'Mantén la piel hidratada, usa protector solar diariamente, evita el sol directo por 48 horas, no uses productos irritantes por 3 días.',
      price: 'Sesión única: $1,800 MXN | Paquete 4 sesiones: $6,500 MXN',
      location: 'Clínica Nutriser, Emiliano Zapata 2, Valentín Gómez Farías, Puerto Vallarta, Jalisco',
      schedule: 'Lunes a viernes: 9:00 AM - 6:00 PM | Sábados: 10:00 AM - 2:00 PM'
    }
  },
  rellenos: {
    title: 'Rellenos Faciales en Puerto Vallarta | Nutriser',
    h1: 'Rellenos Faciales en Puerto Vallarta',
    description: 'Rellenos faciales profesionales en Puerto Vallarta. Resultados naturales. Ácido hialurónico de calidad premium.',
    content: {
      intro: 'Los rellenos faciales con ácido hialurónico son un tratamiento que restaura volumen, suaviza líneas y realza facciones de manera natural y reversible.',
      whatIs: 'Son inyecciones de ácido hialurónico que rellenan arrugas, restauran volumen perdido y realzan características faciales como pómulos, labios y mentón.',
      forWho: 'Ideal para personas que desean suavizar líneas de expresión profundas, restaurar volumen facial, realzar labios o mejorar la definición de sus facciones.',
      benefits: [
        'Suaviza arrugas profundas',
        'Restaura volumen facial',
        'Realza labios naturalmente',
        'Resultados inmediatos',
        'Efecto completamente reversible',
        'Resultados naturales y personalizables'
      ],
      duration: '20-30 minutos',
      care: 'Evita masajear la zona por 24 horas, no hagas ejercicio intenso por 48 horas, evita el calor extremo, mantén la piel hidratada.',
      price: 'Por jeringa: $1,200 MXN | Paquete 2 jeringas: $2,200 MXN',
      location: 'Clínica Nutriser, Emiliano Zapata 2, Valentín Gómez Farías, Puerto Vallarta, Jalisco',
      schedule: 'Lunes a viernes: 9:00 AM - 6:00 PM | Sábados: 10:00 AM - 2:00 PM'
    }
  }
};

export default function ServicePage({ serviceId }: ServicePageProps) {
  const [, navigate] = useLocation();
  const service = SERVICES[serviceId as keyof typeof SERVICES];

  useEffect(() => {
    if (!service) {
      navigate('/404');
    }
  }, [serviceId, service, navigate]);

  if (!service) return null;

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>{service.title}</title>
        <meta name="description" content={service.description} />
        <meta property="og:title" content={service.h1} />
        <meta property="og:description" content={service.description} />
        <meta name="keywords" content={`${service.h1}, Puerto Vallarta, Jalisco, Nutriser`} />
      </head>

      <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-white">
        {/* Header */}
        <div className="bg-[#1a1a1a] text-white py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.h1}</h1>
            <p className="text-lg text-gray-300">{service.description}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-12">
            <p className="text-lg text-gray-700 leading-relaxed">{service.content.intro}</p>
          </section>

          {/* Grid de información */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Qué es */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">¿Qué es?</h2>
              <p className="text-gray-700">{service.content.whatIs}</p>
            </div>

            {/* Para quién */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">¿Para quién?</h2>
              <p className="text-gray-700">{service.content.forWho}</p>
            </div>
          </div>

          {/* Beneficios */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">Beneficios</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {service.content.benefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <CheckCircle className="w-6 h-6 text-[#C5A55A] flex-shrink-0 mt-1" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Información práctica */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[#FAF7F2] p-6 rounded-lg">
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C5A55A]" />
                Duración
              </h3>
              <p className="text-gray-700">{service.content.duration}</p>
            </div>

            <div className="bg-[#FAF7F2] p-6 rounded-lg">
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#C5A55A]" />
                Precio
              </h3>
              <p className="text-gray-700">{service.content.price}</p>
            </div>

            <div className="bg-[#FAF7F2] p-6 rounded-lg md:col-span-2">
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">Cuidados posteriores</h3>
              <p className="text-gray-700">{service.content.care}</p>
            </div>
          </div>

          {/* Ubicación e información de contacto */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">Ubicación e Información</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C5A55A]" />
                  Ubicación
                </h3>
                <p className="text-gray-700 mb-4">{service.content.location}</p>
                <p className="text-sm text-gray-600">Puerto Vallarta, Jalisco, México</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#C5A55A]" />
                  Horario
                </h3>
                <p className="text-gray-700">{service.content.schedule}</p>
                <p className="text-sm text-gray-600 mt-2">Abierto 6 días a la semana</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-[#C5A55A] to-[#d4b46a] p-8 rounded-lg text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">¿Listo para comenzar?</h2>
            <p className="text-white mb-6 text-lg">Agenda tu cita hoy y descubre los beneficios de este tratamiento</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-[#C5A55A] hover:bg-gray-100 font-bold px-8 py-6 text-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Cita
              </Button>
              <Button className="bg-white/20 text-white hover:bg-white/30 font-bold px-8 py-6 text-lg border border-white">
                <Phone className="w-5 h-5 mr-2" />
                Llamar: 322 450 3257
              </Button>
            </div>
          </section>

          {/* Schema markup para SEO local */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Nutriser Aesthetic & Nutrition",
              "description": service.description,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Emiliano Zapata 2",
                "addressLocality": "Puerto Vallarta",
                "addressRegion": "Jalisco",
                "postalCode": "48310",
                "addressCountry": "MX"
              },
              "telephone": "+52 322 450 3257",
              "url": "https://nutriserpv.com",
              "image": "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png",
              "priceRange": "$$",
              "areaServed": "Puerto Vallarta, Jalisco",
              "serviceType": service.h1
            })}
          </script>
        </div>
      </div>
    </>
  );
}
