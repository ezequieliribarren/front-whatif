'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from '@/app/ui/about.module.css';
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
            return node.text.trim();
          } else if (node.type === 'linebreak') {
            return '<br />';
          }
          return '';
        })
        .join('');

      return htmlContent.trim() ? `<p>${htmlContent}</p>` : '';
    })
    .filter(Boolean)
    .join('');
}

export default function Page() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [altTitles, setAltTitles] = useState(false);
  const [formerMembers, setFormerMembers] = useState<TeamMember[]>([]);
  const [hoverFormerId, setHoverFormerId] = useState<string | null>(null);
  

  // Estado para scroll up/down y controlar altura y descripción
  const [containerHeight, setContainerHeight] = useState<'auto' | '35rem'>('auto');
  const [showDescription, setShowDescription] = useState(true);
  const lastScrollY = useRef(0);

  const boxWidth = 324;
  const boxHeight = 486;

  // Detectar si es tablet o móvil
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });

  // Detectar scroll y dirección (sobre containerAbout)
useEffect(() => {
  const SCROLL_THRESHOLD = 120; // píxeles para que empiece a comprimirse

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY.current && currentScrollY > SCROLL_THRESHOLD) {
      // Scroll down y pasamos el umbral: comprimimos
      setContainerHeight('35rem');
      setShowDescription(false);
    } else if (currentScrollY < SCROLL_THRESHOLD) {
      // Scroll arriba o no llegamos al umbral: expandimos
      setContainerHeight('auto');
      setShowDescription(true);
    }
    lastScrollY.current = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => window.removeEventListener('scroll', handleScroll);
}, []);


  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch de miembros activos
        const resActive = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/team-members?sort=order`
        );
        const dataActive = await resActive.json();

        // Filtrar el miembro "Team"
        const team = dataActive.docs.find((member: TeamMember) => member.name === 'Team') || null;
        setTeamMember(team);

        // Guardar el resto
        const filtered = dataActive.docs.filter((member: TeamMember) => member.name !== 'Team');
        setTeamMembers(filtered);

        // Fetch de ex-miembros
        const resFormer = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/former-members?limit=100&sort=order`
        );
        const dataFormer = await resFormer.json();
        setFormerMembers(dataFormer.docs || []);
      } catch (err) {
        console.error('Error fetching team/former members:', err);
      }
    }
    fetchData();
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
        
        {/* Overlay y plus icon solo en desktop */}
        {!isTabletOrMobile && (
          <>
            <div className={styles.svgOverlay}>
              <img src="/plus.png" alt="Overlay pattern" />
            </div>
            <div className={styles.overlay}></div>
          </>
        )}
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
      <p className={styles.role}>{member.role}</p>
    </div>
  );

  const EmptyCell = () => <div style={{ width: boxWidth, height: boxHeight }} />;

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
    <div
      className={styles.containerAbout}
style={{ height: containerHeight, transition: 'height 0.6s ease-in-out' }}
    >
      <div className="flex justify-center w-full">
        <div className="w-full" style={{ width: boxWidth * 4 + 12 }}>
          {isTabletOrMobile ? (
            <section className={`flex flex-col w-full relative gap-4 ${styles.sectionAbout}`}>
              <h1 className="font-light text-gray-800 text-[32px] font-sans text-center">
                {altTitles
                  ? (
                    <>
                      <span className="font-bold">Explore</span> present(s)
                    </>
                  )
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
                  ? (
                    <>
                      <span className="font-bold">build</span> futures
                    </>
                  )
                  : 'que configuran nuestro cotidiano.'}
              </h2>
              {showDescription && (
                <div
                  className={styles.description}
                  dangerouslySetInnerHTML={{
                    __html: teamMember?.detail
                      ? serializeLexicalToHtml(teamMember.detail)
                      : '',
                  }}
                />
              )}
            </section>
          ) : (
            <section
              className={`flex flex-row w-full relative gap-8 transition-all duration-500 ${styles.sectionAbout}`}
              style={{ height: containerHeight, overflow: 'hidden' }}
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
                style={{ overflow: 'hidden' }}
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
                  {showDescription && (
                    <div
                      className={styles.description}
                      dangerouslySetInnerHTML={{
                        __html: teamMember?.detail
                          ? serializeLexicalToHtml(teamMember.detail)
                          : '',
                      }}
                    />
                  )}
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
          <section className={`flex flex-row w-full relative py-10 gap-8 ${styles.quienesSomos}`}>
            <div className="w-1/2">
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
          <section className={isTabletOrMobile ? 'py-10' : 'grid grid-cols-4 gap-4 py-10'}>
            {isTabletOrMobile ? renderGridCellsResponsive() : renderGridCells()}
          </section>

          {/* Former members con hover para imagen */}
          <section className={styles.sectionFormer}>
            <h2>Former team members</h2>
            <div style={{ position: 'relative' }} className={styles.formerNamesContainer}>
              {formerMembers.map((m, i) => (
                <div
                  key={m.id}
                  style={{ display: 'inline-block', position: 'relative', marginRight: '8px' }}
                  onMouseEnter={() => setHoverFormerId(m.id)}
                  onMouseLeave={() => setHoverFormerId(null)}
                >
                  <h4 className={styles.formerName} style={{ cursor: 'pointer' }}>
                    {m.name}
                    {i < formerMembers.length - 1 && ','}
                  </h4>

                  {/* Imagen grande en hover */}
                  {hoverFormerId === m.id && m.image?.url && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '8px',
                        width: '200px',
                        height: '200px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                        opacity: 1,
                        transition: 'opacity 0.3s ease',
                        zIndex: 10,
                        backgroundColor: '#fff',
                      }}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${m.image.url}`}
                        alt={m.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="flex justify-center py-10">
            <button
              className={`flex items-center gap-2.5 px-4 py-1 border border-black text-black font-serif hover:bg-black hover:text-white transition-colors rounded ${styles.buttonSelected}`}
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l4 4m0 0l4-4m-4 4V4" />
              </svg>
              <span className="text-lg font-normal">Selected Work</span>
            </button>
          </section>

<section className={styles.contactSection}>
  <div className={styles.contact}>
    <h2>Contact</h2>
  </div>
  <div className={styles.contactGrid}>
    <div>
          <div className={styles.up}>
      <h4>MAPS</h4>
      <p>
        C/ Aldapa, 2 Local 4, Esquina,<br />
        C/ Matilde Hernández, 28025,<br />
        Madrid
      </p>
    </div>
    <div className={styles.bottom}>
      <h4>E-MAIL</h4>
      <p>hi@whatif-arch.com</p>
    </div>
    </div>
<div>
   <div className={styles.up}>
      <h4>PHONE</h4>
      <p>+34 697 266 914</p>
    </div>
    <div className={styles.bottom}>
      <h4>INSTAGRAM</h4>
      <p>@whatif_architecture</p>
    </div>
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
