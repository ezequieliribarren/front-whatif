'use client';

import Link from 'next/link';
import styles from '../ui/privacy.module.css';

export default function PoliticasDePrivacidadPage() {
  const updatedAt = '2025-01-01';
  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1>Política de Privacidad</h1>
        <p className={styles.meta}>Última actualización: {updatedAt}</p>
      </section>

      <section className={styles.section}>
        <h2>1. Introducción</h2>
        <p>
          En What If Architecture (en adelante, «nosotros»), nos comprometemos a proteger tu
          privacidad. Esta Política de Privacidad explica qué datos personales recopilamos, cómo los
          utilizamos y cuáles son tus derechos.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Responsable del tratamiento</h2>
        <p>
          Responsable: What If Architecture — Contacto: <a href="mailto:hi@whatif-arch.com">hi@whatif-arch.com</a>
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Datos que podemos recopilar</h2>
        <ul className={styles.list}>
          <li>Datos de contacto: nombre, correo electrónico, teléfono.</li>
          <li>Datos de navegación: dirección IP, identificadores de dispositivo, páginas visitadas, interacción y cookies.</li>
          <li>Datos que nos facilites voluntariamente a través de formularios o comunicaciones.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>4. Finalidades y bases legales</h2>
        <ul className={styles.list}>
          <li>Atender consultas y solicitudes — Base legal: tu consentimiento o medidas precontractuales.</li>
          <li>Prestación de servicios — Base legal: ejecución de un contrato.</li>
          <li>Mejora del sitio y seguridad — Base legal: interés legítimo.</li>
          <li>Cumplimientos legales y requerimientos de autoridades — Base legal: obligación legal.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>5. Conservación de datos</h2>
        <p>
          Conservamos los datos durante el tiempo necesario para cumplir con las finalidades descritas
          y/o mientras exista una obligación legal o posibilidad de reclamación.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Destinatarios y transferencias</h2>
        <p>
          Podemos compartir datos con proveedores que nos prestan servicios (alojamiento, analítica,
          comunicaciones) bajo contratos que garantizan la confidencialidad y el cumplimiento normativo.
          No realizamos transferencias internacionales sin garantías adecuadas.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Derechos de las personas usuarias</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y
          portabilidad escribiendo a <a href="mailto:hi@whatif-arch.com">hi@whatif-arch.com</a>. Si
          consideras que no hemos atendido correctamente tu solicitud, puedes presentar una reclamación
          ante la autoridad de control competente.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Cookies</h2>
        <p>
          Utilizamos cookies o tecnologías similares para mejorar la experiencia, realizar mediciones y
          mantener la seguridad. Puedes configurar tu navegador para bloquear o eliminar cookies. Si
          disponemos de una política específica de cookies, la encontrarás vinculada desde esta página.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra accesos
          no autorizados, pérdida o alteración. No obstante, ninguna transmisión por Internet es
          completamente segura.
        </p>
      </section>

      <section className={styles.section}>
        <h2>10. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta Política para reflejar cambios legales o funcionales. Publicaremos la
          versión vigente en esta misma página.
        </p>
      </section>

      <section className={styles.section}>
        <p>
          ¿Tienes dudas? Escríbenos a <a href="mailto:hi@whatif-arch.com">hi@whatif-arch.com</a> o vuelve a la{' '}
          <Link href="/">página principal</Link>.
        </p>
      </section>
    </main>
  );
}

