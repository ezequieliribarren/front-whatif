'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/app/ui/about.module.css';

// Si no tienes react-responsive, instálalo con: npm install react-responsive
import { useMediaQuery } from 'react-responsive';

type TeamMember = {
  id: string;
  name: string;
  role: string;
  image?: {
    url: string;
  };
  detail?: any;
};

// Función para convertir el richText Lexical a HTML simple
function serializeLexicalToHtml(richText: any): string {
  if (!richText?.root?.children) return '';

  return richText.root.children
    .map((paragraph: any) => {
      if (!paragraph.children) return '';

      const htmlContent = paragraph.children
        .map((node: any) => {
          if (node.type === 'text') {
            return node.text;
          } else if (node.type === 'linebreak') {
            return '<br />';
          }
          return '';
        })
        .join('');

      return `<p>${htmlContent}</p>`;
    })
    .join('');
}

export default function Page() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [altTitles, setAltTitles] = useState(false);

  const boxWidth = 324;
  const boxHeight = 486;

  // Detectar si es tablet o móvil
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/team-members?sort=order`
        );
        const data = await res.json();

        const team = data.docs.find((member: TeamMember) => member.name === 'Team') || null;
        setTeamMember(team);

        const filtered = data.docs.filter((member: TeamMember) => member.name !== 'Team');
        setTeamMembers(filtered);
      } catch (err) {
        console.error('Error fetching team members:', err);
      }
    }
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Alternancia automática de hover cada 3 segundos (solo desktop)
  useEffect(() => {
    if (!isTabletOrMobile && teamMembers.length > 0) {
      let idx = 0;
      const interval = setInterval(() => {
        setHoveredId(teamMembers[idx % teamMembers.length].id);
        idx++;
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [teamMembers, isTabletOrMobile]);

  // Alternar títulos cada 3 segundos solo en tablet/mobile
  useEffect(() => {
    if (isTabletOrMobile) {
      const interval = setInterval(() => {
        setAltTitles(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setAltTitles(false);
    }
  }, [isTabletOrMobile]);

  const CellImage = ({
    member,
    boxWidth,
    boxHeight,
    setHoveredId,
  }: {
    member: TeamMember;
    boxWidth: number;
    boxHeight: number;
    setHoveredId: React.Dispatch<React.SetStateAction<string | null>>;
  }) => (
    <div
      className={styles.imageContainer}
      style={{ width: boxWidth, height: boxHeight }}
      // Solo activa hover en desktop
      onMouseEnter={() => !isTabletOrMobile && setHoveredId(member.id)}
      onMouseLeave={() => !isTabletOrMobile && setHoveredId(null)}
      key={member.id + '-img'}
    >
      {member.image?.url ? (
<>
  <img
    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${member.image.url}`}
    alt={member.name}
    className={styles.image}
  />
  <div className={styles.svgOverlay}>
    {/* Puedes reemplazar esto por un <svg> real si lo prefieres en línea */}
    <img src="/plus.png" alt="Overlay pattern" />
  </div>
  <div className={styles.overlay}></div>
</>

      ) : (
        <div className={styles.noImage}>Sin imagen</div>
      )}
    </div>
  );

  const CellInfo = ({
    member,
    boxWidth,
    boxHeight,
    hoveredId,
    arrowDirection,
    alwaysVisible = false,
  }: {
    member: TeamMember;
    boxWidth: number;
    boxHeight: number;
    hoveredId: string | null;
    arrowDirection: 'left' | 'right';
    alwaysVisible?: boolean;
  }) => (
    <div
      className={styles.infoContainer}
      style={{
        width: boxWidth,
        height: boxHeight,
        opacity: alwaysVisible || hoveredId === member.id ? 1 : 0,
        pointerEvents: alwaysVisible || hoveredId === member.id ? 'auto' : 'none',
      }}
      key={member.id + '-info'}
    >
      <div
        className={styles.nameContainer}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexDirection: arrowDirection === 'left' ? 'row-reverse' : 'row',
        }}
      >
        <h3 className={styles.name}>{member.name}</h3>
        <img
          src={arrowDirection === 'left' ? '/left-arrow.png' : '/right-arrow.png'}
          alt="Arrow"
        />
      </div>
      <p
        className={styles.role}
        style={{ display: scrolled ? 'none' : 'block' }}
      >
        {member.role}
      </p>
    </div>
  );

  const EmptyCell = () => <div style={{ width: boxWidth, height: boxHeight }} />;

  // Grid alternando imagen-descripción y descripción-imagen en tablet/móvil (solo un par por fila)
  const renderGridCellsResponsive = () => {
    return teamMembers.map((member, idx) => {
      const isEvenRow = idx % 2 === 0;
      return (
        <div key={`row-resp-${idx}`} className="flex flex-row w-full mb-4">
          {isEvenRow ? (
            <>
              <CellImage {...{ member, boxWidth, boxHeight, setHoveredId }} />
              <CellInfo {...{ member, boxWidth, boxHeight, hoveredId, arrowDirection: 'left', alwaysVisible: true }} />
            </>
          ) : (
            <>
              <CellInfo {...{ member, boxWidth, boxHeight, hoveredId, arrowDirection: 'right', alwaysVisible: true }} />
              <CellImage {...{ member, boxWidth, boxHeight, setHoveredId }} />
            </>
          )}
        </div>
      );
    });
  };

  // Grid original para desktop
  const renderGridCells = () => {
    const rows: React.ReactNode[] = [];
    for (let i = 0; i < teamMembers.length; i += 2) {
      const memberA = teamMembers[i];
      const memberB = teamMembers[i + 1];
      const isEvenRow = (i / 2) % 2 === 0;
      rows.push(
        <React.Fragment key={`row-${i}`}>
          {isEvenRow ? (
            <>
              <CellImage {...{ member: memberA, boxWidth, boxHeight, setHoveredId }} />
              <CellInfo {...{ member: memberA, boxWidth, boxHeight, hoveredId, arrowDirection: 'left' }} />
              {memberB ? (
                <>
                  <CellImage {...{ member: memberB, boxWidth, boxHeight, setHoveredId }} />
                  <CellInfo {...{ member: memberB, boxWidth, boxHeight, hoveredId, arrowDirection: 'left' }} />
                </>
              ) : (
                <>
                  <EmptyCell />
                  <EmptyCell />
                </>
              )}
            </>
          ) : (
            <>
              <CellInfo {...{ member: memberA, boxWidth, boxHeight, hoveredId, arrowDirection: 'right' }} />
              <CellImage {...{ member: memberA, boxWidth, boxHeight, setHoveredId }} />
              {memberB ? (
                <>
                  <CellInfo {...{ member: memberB, boxWidth, boxHeight, hoveredId, arrowDirection: 'right' }} />
                  <CellImage {...{ member: memberB, boxWidth, boxHeight, setHoveredId }} />
                </>
              ) : (
                <>
                  <EmptyCell />
                  <EmptyCell />
                </>
              )}
            </>
          )}
        </React.Fragment>
      );
    }
    return rows;
  };

  return (
    <div className={styles.containerAbout}>
      <div className="flex justify-center w-full">
        <div className="w-full" style={{ width: boxWidth * 4 + 12 }}>
          {/* About comprimido con scroll */}
          {isTabletOrMobile ? (
            <section className={`flex flex-col w-full relative gap-4 ${styles.sectionAbout}`}>
              <h1 className="font-light text-gray-800 text-[32px] font-sans text-center">
                {altTitles
                  ? <><span className="font-bold">Explore</span> present(s)</>
                  : 'Construimos imaginarios colectivos'}
              </h1>
              {teamMember?.image?.url ? (
                <img
                  className="w-full h-auto max-h-[400px] object-cover"
                  alt={teamMember.name}
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${teamMember.image.url}`}
                />
              ) : (
                <div>No image available</div>
              )}
              <h2 className="font-light text-gray-800 text-[32px] text-center font-sans">
                {altTitles
                  ? <><span className="font-bold">build</span> futures</>
                  : 'que configuran nuestro cotidiano.'}
              </h2>
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{
                  __html: teamMember?.detail
                    ? serializeLexicalToHtml(teamMember.detail)
                    : '',
                }}
              />
            </section>
          ) : (
            <section
              className={`flex flex-row w-full relative gap-8 transition-all duration-500 ${styles.sectionAbout} ${
                scrolled ? styles.aboutCompressed : ''
              }`}
            >
              <div className="w-1/2">
                {teamMember?.image?.url ? (
                  <img
                    className="w-full h-auto max-h-[600px] object-cover"
                    alt={teamMember.name}
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${teamMember.image.url}`}
                  />
                ) : (
                  <div>No image available</div>
                )}
              </div>
              <div
                className="w-1/2 flex flex-col justify-center"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div>
                  <h1 className="font-light text-gray-800 text-[32px] font-sans">
                    {isHovered ? (
                      <>
                        <span className="font-bold">Explore</span> present(s)
                      </>
                    ) : (
                      'Construimos imaginarios colectivos'
                    )}
                  </h1>
                  <div
                    className={styles.description}
                    dangerouslySetInnerHTML={{
                      __html: teamMember?.detail
                        ? serializeLexicalToHtml(teamMember.detail)
                        : '',
                    }}
                  />
                </div>
                <h2 className="font-light text-gray-800 text-[32px] text-right font-sans">
                  {isHovered ? (
                    <>
                      <span className="font-bold">build</span> futures
                    </>
                  ) : (
                    'que configuran nuestro cotidiano.'
                  )}
                </h2>
              </div>
            </section>
          )}

          {/* Quiénes somos - sección debajo */}
<section className={`flex flex-row w-full relative py-10 gap-8 ${styles.quienesSomos}`}>            <div className="w-1/2">
              <p className={styles.description}>
                Somos un equipo formado por arquitectxs y diseñadorxs interdisciplinares encargadxs de hacer tangibles las ideas.
              </p>
            </div>
            <div className="w-1/2 flex flex-col items-end">
              <h2 className="font-light text-gray-800 text-[32px] text-right font-sans">
                ¿Quiénes somos?
              </h2>
            </div>
          </section>

          {/* Grid responsive */}
          <section className={isTabletOrMobile ? "py-10" : "grid grid-cols-4 gap-4 py-10"}>
            {isTabletOrMobile ? renderGridCellsResponsive() : renderGridCells()}
          </section>

          <section className="flex justify-center py-10">
            <button
              className="flex items-center gap-2.5 px-4 py-1 border border-black text-black font-serif hover:bg-black hover:text-white transition-colors rounded"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v8m0-8V4m0 0L8 8m4-4l4 4" />
              </svg>
              <span className="text-lg font-normal">Our Dossier</span>
            </button>
          </section>

          <section className={styles.contactSection}>
            <div className={styles.contact}>
              <h2>Contact</h2>
            </div>
            <div className={styles.contactGrid}>
              <div>
                <h4>MAPS</h4>
                <p>
                  C/ Aldepa, 2 Local 4, Esquina,
                  <br />
                  C/ Matilde Hernández, 28025,
                  <br />
                  Madrid
                </p>
              </div>
              <div>
                <h4>E-MAIL</h4>
                <p>hi@whatif-arch.com</p>
              </div>
              <div>
                <h4>PHONE</h4>
                <p>+34 697 266 914</p>
              </div>
              <div>
                <h4>INSTAGRAM</h4>
                <p>@whatif_architecture</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <h3>
            e x p l o r e
            <br /> p r e s e n t(s)
          </h3>
          <span>/</span>
          <h3>
            b u i l d
            <br /> f u t u r e s
          </h3>
          <span>/</span>
          <h3>
            e x p l o r e
            <br /> p r e s e n t(s)
          </h3>
          <span>/</span>
          <h3>
            b u i l d <br /> f u t u r e s
          </h3>
        </div>
      </div>
    </div>
  );
}