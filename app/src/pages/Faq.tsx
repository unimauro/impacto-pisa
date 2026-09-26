import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Titulo, Panel } from '../components/ui'

export const FAQ: { q: string; a: string; link?: string }[] = [
  { q: '¿Este observatorio demuestra que la minería o la contaminación bajan las notas o enferman a la gente?', a: 'No. Muestra asociaciones a nivel de distrito, con sus intervalos de confianza y controles, y las clasifica en una escalera de evidencia. A esta escala la señal ambiental es pequeña frente a la pobreza y la ruralidad; eso no descarta daños locales que el promedio distrital oculta.', link: '/relaciones' },
  { q: '¿De dónde salen los datos?', a: 'Solo de fuentes oficiales o científicas con URL: INGEMMET (geoquímica), MINEM (pasivos, REINFO), OEFA (agua, emergencias, minería ilegal), MINSA-SINADEF (defunciones), UMC-MINEDU (ENLA/ECE), ESCALE, INEI, PNUD y MEF. El catálogo completo, con limitaciones y estado de verificación, está en Metodología.', link: '/metodologia' },
  { q: '¿Qué significa un distrito en blanco en el mapa?', a: 'Que no hay medición pública para esa variable, no que esté limpio ni que no tenga problema. La sección Brechas muestra dónde se ha medido y dónde no.', link: '/brechas' },
  { q: '¿Los sedimentos de quebrada son el agua que bebe la gente?', a: 'No. Describen la geología y la actividad humana de la cuenca. Para el agua que se consume hacen falta los datos de DIGESA y DIRESA, que no se publican como dato abierto; el observatorio incluye la solicitud de acceso a la información lista para presentar.' },
  { q: '¿Un registro REINFO es minería ilegal?', a: 'No. Es un minero en proceso de formalización. La minería ilegal se muestra solo con los polígonos identificados por OEFA y SERNANP.' },
  { q: '¿Por qué las tasas de mortalidad no coinciden con las cifras oficiales?', a: 'Son tasas crudas (sin ajustar por edad) calculadas sobre certificados de defunción por distrito de domicilio, con subregistro variable. Sirven para comparar territorios con cautela, no como cifra oficial.', link: '/salud' },
  { q: '¿Puedo descargar y reutilizar los datos?', a: 'Sí. Los datos procesados son CC BY 4.0 y el código MIT. Cada fuente original conserva su licencia; cítala junto al observatorio.', link: '/metodologia' },
  { q: '¿Cómo reporto un error?', a: 'Abre un issue en el repositorio de GitHub con la sección, el distrito, el dato y la fuente que lo contradice. Cada versión de datos pasa pruebas automáticas y una revisión de fuentes cuyo resultado se publica.', link: '/ecosistema' },
  { q: '¿Con qué frecuencia se actualiza?', a: 'Las capas de INGEMMET y MINEM se refrescan cada mes por GitHub Actions. SINADEF, OEFA y educación se actualizan cuando las instituciones publican nuevas versiones (SINADEF es diario; ENLA anual).' },
  { q: '¿Qué sigue?', a: 'Padrón de colegios con coordenadas para medir cuántos alumnos están a menos de 1 km de cada fuente documentada; anemia infantil (SIEN); deforestación minera (Amazon Mining Watch); tasas estandarizadas por edad; modelos espaciales.', link: '/conclusiones' },
]
export default function Faq() {
  useEffect(() => {
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'faq-ld'
    s.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })
    document.head.appendChild(s); return () => { document.getElementById('faq-ld')?.remove() }
  }, [])
  return (
    <>
      <Titulo sub="Respuestas cortas a las preguntas que más se repiten sobre qué muestra, qué no muestra y cómo usar el observatorio.">Preguntas frecuentes</Titulo>
      <div className="grid gap-3 md:grid-cols-2">{FAQ.map(f => <Panel key={f.q}><h3 className="font-medium">{f.q}</h3><p className="mt-1 text-sm">{f.a}{f.link && <> <Link className="underline" to={f.link}>Ver sección</Link>.</>}</p></Panel>)}</div>
    </>
  )
}
