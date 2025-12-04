'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/ui/about.module.css';
import { useMediaQuery } from 'react-responsive';
import { useCursor } from '@/app/components/CursorProvider';

type TeamMember = {
  id: string;
  name: string;
  role: string;
  link?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  url?: string;
  image?: { url: string };
  detail?: any;
  studies?: any;
  studies_en?: any;
  studies_es?: any;
  education?: any;
  education_en?: any;
  education_es?: any;
  formacion?: any;
  formacion_en?: any;
  formacion_es?: any;
};

type SelectedClient = {
  id?: string;
  _id?: string;
  name: string;
  link: string;
};

function serializeLexicalToHtml(richText: any): string {
  if (!richText?.root?.children) return '';
  return richText.root.children
    .map((paragraph: any) => {
      if (!paragraph.children) return '';
      const htmlContent = paragraph.children
        .map((node: any) => {
          if (node.type === 'text') return node.text.trim();
          if (node.type === 'linebreak') return '<br />';
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
  const [selectedClients, setSelectedClients] = useState<SelectedClient[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [dossierUrl, setDossierUrl] = useState<string | null>(null);
  const [footerInfo, setFooterInfo] = useState<{
    direccion?: string;
    telefono?: string;
    mail?: string;
    instagram?: string;
    mapsLink?: string;
  } | null>(null);

  const boxWidth = 324;
  const boxHeight = 486;
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });
  const { show, hide, move, isTouch } = useCursor();
  const email = footerInfo?.mail || 'hi@whatif-arch.com';
  const instagramUrl = (() => {
    if (footerInfo?.instagram) return footerInfo.instagram;
    const found = selectedClients.find((c) => (c.name || '').toLowerCase().includes('instagram'));
    return found?.link || '';
  })();

  useEffect(() => {
    const SCROLL_THRESHOLD = 120;
    if (isTabletOrMobile) {
      setScrolled(false);
      return; // disable scroll-triggered effects on tablet/mobile
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTabletOrMobile]);

  // Fetch footer info
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/payload/footer', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const doc = Array.isArray(data?.docs) && data.docs.length > 0 ? data.docs[0] : null;
        if (doc)
          setFooterInfo({
            direccion: doc.direccion,
            telefono: doc.telefono,
            mail: doc.mail,
            instagram: doc.instagram,
            mapsLink: doc.mapsLink,
          });
      } catch (e) {
        console.error('Error fetching footer info:', e);
      }
    })();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const backendBase =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        (process.env.PAYLOAD_API_URL ? process.env.PAYLOAD_API_URL.replace(/\/api$/, '') : undefined);

      if (!backendBase) {
        console.error('NEXT_PUBLIC_BACKEND_URL no está definida. Configúrala en .env.local');
        return;
      }

      // Lanza todas las requests en paralelo y maneja cada una por separado
      const [activeRes, formerRes, clientsRes, dossierRes] = await Promise.allSettled([
        fetch(`/api/payload/team-members?sort=order&locale=all`),
        fetch(`/api/payload/former-members?limit=100&sort=order`),
        fetch(`/api/payload/selected-clients?limit=100&sort=name`),
        fetch(`/api/payload/dossier?limit=1`),
      ]);

      if (activeRes.status === 'fulfilled') {
        try {
          const dataActive = await activeRes.value.json();
          const team = dataActive.docs.find((m: TeamMember) => m.name === 'Team') || null;
          setTeamMember(team);
          setTeamMembers(dataActive.docs.filter((m: TeamMember) => m.name !== 'Team'));
        } catch (e) {
          console.error('Error parseando team-members:', e);
        }
      } else {
        console.error('Error fetching team-members:', activeRes.reason);
      }

      if (formerRes.status === 'fulfilled') {
        try {
          const dataFormer = await formerRes.value.json();
          const docs: TeamMember[] = Array.isArray(dataFormer?.docs) ? dataFormer.docs : [];
          const sorted = [...docs].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setFormerMembers(sorted);
        } catch (e) {
          console.error('Error parseando former-members:', e);
        }
      } else {
        console.error('Error fetching former-members:', formerRes.reason);
      }

      if (clientsRes.status === 'fulfilled') {
        try {
          const dataClients = await clientsRes.value.json();
          setSelectedClients(dataClients.docs || []);
        } catch (e) {
          console.error('Error parseando selected-clients:', e);
        }
      } else {
        console.error('Error fetching selected-clients:', clientsRes.reason);
      }

      if (dossierRes.status === 'fulfilled') {
        try {
          const dataDossier = await dossierRes.value.json();
          const dossierDoc = dataDossier?.docs?.[0];
          const pdfUrl = dossierDoc?.archivo?.url ? `${backendBase}${dossierDoc.archivo.url}` : null;
          setDossierUrl(pdfUrl);
        } catch (e) {
          console.error('Error parseando dossier:', e);
        }
      } else {
        console.error('Error fetching dossier:', dossierRes.reason);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!isTabletOrMobile && teamMembers.length > 0 && hoveredId === null) {
      let idx = 0;
      const interval = setInterval(() => {
        setHoveredId((prev) => {
          if (prev !== null) return prev; // pause rotation while hovering
          const id = teamMembers[idx % teamMembers.length].id;
          idx++;
          return id;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [teamMembers, isTabletOrMobile, hoveredId]);

  useEffect(() => {
    if (isTabletOrMobile) {
      const interval = setInterval(() => setAltTitles(prev => !prev), 3000);
      return () => clearInterval(interval);
    } else setAltTitles(false);
  }, [isTabletOrMobile]);

  // Keep hover active when moving between the image and the info of the same member
  const handleMemberMouseLeave = (memberId: string) => (e: React.MouseEvent<HTMLElement>) => {
    if (isTabletOrMobile) return;
    const rt = e.relatedTarget as Node | null;
    if (!rt) { setHoveredId(null); return; }
    let el: HTMLElement | null = rt as HTMLElement;
    while (el) {
      if ((el as HTMLElement).dataset && (el as HTMLElement).dataset.memberId === memberId) {
        return; // still within same member block; keep hovered
      }
      el = el.parentElement;
    }
    setHoveredId(null);
  };

  const getMemberLink = (member: TeamMember): string | null => {
    const candidates = [
      member.link,
      member.website,
      member.instagram,
      member.linkedin,
      member.url,
      (member as any).social,
      (member as any).socialLink,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) {
        const val = c.trim();
        if (/^https?:\/\//i.test(val)) return val;
        // assume https if missing protocol
        return `https://${val}`;
      }
    }
    return null;
  };

  const CellImage = ({ member }: { member: TeamMember }) => {
    const imageNode = (
      <div
        className={styles.imageContainer}
        style={{ width: boxWidth, height: boxHeight }}
        onMouseEnter={() => !isTabletOrMobile && setHoveredId(member.id)}
        onMouseLeave={handleMemberMouseLeave(member.id)}
        data-member-id={member.id}
        key={member.id + '-img'}
      >
        {member.image?.url ? (
          <>
            <img
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${member.image.url}`}
              alt={member.name}
              className={styles.image}
            />
            {!isTabletOrMobile && (
              <>
                <div className={styles.svgOverlay}><img src="/plus.png" alt="Overlay" /></div>
                <div className={styles.overlay}></div>
              </>
            )}
          </>
        ) : <div className={styles.noImage}>Sin imagen</div>}
      </div>
    );

    const memberHref = getMemberLink(member);
    if (memberHref) {
      return (
        <a
          href={memberHref}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.imageLink}
          style={{ width: boxWidth, height: boxHeight }}
          data-cursor-clickable="true"
        >
          {imageNode}
        </a>
      );
    }

    return imageNode;
  };

  const CellInfo = ({ member, arrowDirection, alwaysVisible = false }: { member: TeamMember; arrowDirection: 'left' | 'right'; alwaysVisible?: boolean }) => (
    <div
      className={styles.infoContainer}
      style={{
        width: boxWidth,
        height: boxHeight,
        opacity: alwaysVisible || hoveredId === member.id ? 1 : 0,
        pointerEvents: alwaysVisible || hoveredId === member.id ? 'auto' : 'none',
      }}
      onMouseEnter={() => !isTabletOrMobile && setHoveredId(member.id)}
      onMouseLeave={handleMemberMouseLeave(member.id)}
      data-member-id={member.id}
      key={member.id + '-info'}
    >
      <div
        className={styles.nameContainer}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: arrowDirection === 'left' ? 'row-reverse' : 'row' }}
      >
        <h3 className={styles.name}>{member.name}</h3>
        <img src={arrowDirection === 'left' ? '/left-arrow.png' : '/right-arrow.png'} alt="Arrow" />
      </div>
      <p className={styles.role}>{member.role}</p>
      {(() => {
        const src = (member.studies_es ?? member.education_es ?? (member as any).formación ?? member.formacion_es ??
          member.studies ?? member.education ?? member.formacion ??
          member.studies_en ?? member.education_en ?? member.formacion_en);
        const srcFinal = src ?? (member as any).Estudios ?? (member as any).estudios;
        if (!srcFinal) return null;
        let html = '';
        if ((src ?? srcFinal)?.root?.children) {
          html = serializeLexicalToHtml(src ?? srcFinal);
        } else if (Array.isArray(src ?? srcFinal)) {
          html = `<p>${src.filter(Boolean).join(' · ')}</p>`;
        } else if (typeof src === 'string') {
          html = `<p>${src}</p>`;
        }
        if (!html && Array.isArray(srcFinal)) {
          html = `<p>${srcFinal.filter(Boolean).join(' · ')}</p>`;
        } else if (!html && typeof srcFinal === 'string') {
          html = `<p>${srcFinal}</p>`;
        }
        return html ? (
          <div className={styles.studies} dangerouslySetInnerHTML={{ __html: html }} />
        ) : null;
      })()}
    </div>
  );

  const EmptyCell = () => <div style={{ width: boxWidth, height: boxHeight }} />;

  const renderGridCellsResponsive = () =>
    teamMembers.map((member, idx) => {
      const isEvenRow = idx % 2 === 0;
      return (
        <div key={`row-resp-${idx}`} className="flex flex-row w-full mb-4">
          {isEvenRow ? (
            <>
              <CellImage member={member} />
              <CellInfo member={member} arrowDirection="left" alwaysVisible />
            </>
          ) : (
            <>
              <CellInfo member={member} arrowDirection="right" alwaysVisible />
              <CellImage member={member} />
            </>
          )}
        </div>
      );
    });

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
              <CellImage member={memberA} />
              <CellInfo member={memberA} arrowDirection="left" />
              {memberB ? <><CellImage member={memberB} /><CellInfo member={memberB} arrowDirection="left" /></> : <><EmptyCell /><EmptyCell /></>}
            </>
          ) : (
            <>
              <CellInfo member={memberA} arrowDirection="right" />
              <CellImage member={memberA} />
              {memberB ? <><CellInfo member={memberB} arrowDirection="right" /><CellImage member={memberB} /></> : <><EmptyCell /><EmptyCell /></>}
            </>
          )}
        </React.Fragment>
      );
    }
    return rows;
  };

  return (
    <div className={`containerAbout ${scrolled ? 'scrolled' : ''}`}>
      <div className="flex justify-center w-full">
        <div className="w-full" style={{ width: isTabletOrMobile ? '100%' : (boxWidth * 4 + 12) }}>
          <section className={`flex flex-row w-full relative gap-8 ${styles.sectionAbout} ${scrolled ? styles.sectionScrolled : ''}`}>
            <div className="w-1/2">
              {teamMember?.image?.url ? (
                <div
                  onMouseEnter={() => { if (!isTabletOrMobile && !isTouch) show('WHAT\nIF', { align: 'right' }); }}
                  onMouseLeave={() => hide()}
                  onMouseMove={(e) => { if (!isTabletOrMobile && !isTouch) move(e.clientX, e.clientY); }}
                  style={{ position: 'relative', cursor: (!isTabletOrMobile && !isTouch) ? 'none' : 'auto' }}
                >
                  {isTabletOrMobile && (
                    <h1 className="font-light text-gray-800 text-[32px] font-sans" style={{ textAlign: 'left', width: '100%' }}>
                      <>
                        <span className="font-bold">Construimos imaginarios</span> colectivos
                      </>
                    </h1>
                  )}
                  <img
                    className="w-full h-auto max-h-[600px] object-cover"
                    alt={teamMember.name}
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${teamMember.image.url}`}
                  />
                  
                </div>
              ) : (
                <div>No image</div>
              )}
              {/* Títulos para mobile/tablet, arriba y abajo de la imagen */}
              {/* Título inferior (mobile) */}
              {isTabletOrMobile && (
                <h2 className="font-light text-gray-800 text-[32px] text-right font-sans" style={{ width: '100%' }}>
                  <>
                    que configuran nuestro <span className="font-bold">cotidiano</span>.
                  </>
                </h2>
              )}
            </div>
            <div className="w-1/2 flex flex-col justify-center">
              <div>
                <h1
                  className="font-light text-gray-800 text-[32px] font-sans"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {isHovered ? (
                    <>
                      <span className="font-bold">Explore</span> present(s)
                    </>
                  ) : (
                    <>
                      <span className="font-bold">Construimos imaginarios</span> colectivos
                    </>
                  )}
                </h1>
                <div className={styles.description} dangerouslySetInnerHTML={{ __html: teamMember?.detail ? serializeLexicalToHtml(teamMember.detail) : '' }} />
              </div>
              <h2
                className="font-light text-gray-800 text-[32px] text-right font-sans"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {isHovered ? (
                  <>
                    <span className="font-bold">build</span> futures
                  </>
                ) : (
                  <>
                    que configuran nuestro <span className="font-bold">cotidiano</span>.
                  </>
                )}
              </h2>
            </div>
          </section>

          <section className={`flex flex-row w-full relative py-10 gap-8 ${styles.quienesSomos}`}>
            <div className="w-1/2">
              <p className={styles.description}>
                Somos un equipo formado por arquitectxs y diseñadorxs interdisciplinares encargadxs de hacer tangibles las ideas.
              </p>
            </div>
            <div className="w-1/2 flex flex-col items-end">
              <h2 className="font-semi-bold text-gray-800 text-[32px] text-right font-sans">¿Quiénes somos?</h2>
            </div>
          </section>

          <section className={isTabletOrMobile ? 'py-10' : 'grid grid-cols-4 gap-4 py-10'}>
            {isTabletOrMobile ? renderGridCellsResponsive() : renderGridCells()}
          </section>

          <section className={styles.sectionFormer}>
            <h2>They’ve worked with us</h2>
            <div style={{ position: 'relative' }} className={styles.formerNamesContainer}>
              {formerMembers.map((m, i) => (
                <div
                  key={m.id}
                  style={{ display: 'inline-block', position: 'relative', marginRight: '8px' }}
                  onMouseEnter={() => m.image?.url && setHoverFormerId(m.id)}
                  onMouseLeave={() => m.image?.url && setHoverFormerId(null)}
                >
                  <h4 className={styles.formerName} style={{ cursor: m.image?.url ? 'pointer' : 'default' }}>
                    {m.name}
                    {i < formerMembers.length - 1 && ','}
                  </h4>
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
                      <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${m.image.url}`} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sectionFormer}>
            <h2>Selected Clients</h2>
            <div style={{ position: 'relative' }} className={styles.formerNamesContainer}>
              {selectedClients.map((c, i) => (
                <div key={`client-${c.id || c._id || `${c.name}-${i}`}`} style={{ display: 'inline-block', marginRight: '8px' }}>
                  <a className={styles.formerName} href={c.link} target="_blank" rel="noopener noreferrer">
                    {c.name}
                  </a>
                  {i < selectedClients.length - 1 && <span>,</span>}
                </div>
              ))}
            </div>
          </section>

          <section className="flex justify-center py-10">
            {dossierUrl ? (
              <a
                href={dossierUrl}
                download
                className={`flex items-center gap-2.5 px-4 py-1 border border-black text-black font-serif hover:bg-black hover:text-white transition-colors rounded ${styles.buttonSelected}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l4 4m0 0l4-4m-4 4V4" />
                </svg>
                <span className="text-lg font-normal">Download Dossier</span>
              </a>
            ) : (
              <button
                disabled
                className={`opacity-50 cursor-not-allowed flex items-center gap-2.5 px-4 py-1 border border-black text-black font-serif rounded ${styles.buttonSelected}`}
              >
                <span className="text-lg font-normal">Dossier no disponible</span>
              </button>
            )}
          </section>
        </div>
      </div>

        <div className={styles.footer}>
          <div className={styles.footerHeader}>
            <h2>Contact</h2>
          </div>
          <div className={styles.footerTop}>
            <div className={styles.footerLeft}>
              {footerInfo?.direccion && (
                <p className={styles.apiAddress}>
                  {footerInfo?.mapsLink ? (
                    <a
                    href={footerInfo.mapsLink.startsWith('http') ? footerInfo.mapsLink : `https://${footerInfo.mapsLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {footerInfo.direccion}
                  </a>
                ) : (
                  footerInfo.direccion
                )}
              </p>
            )}
            <p>C/ Matilde Hernández, 28025, Madrid</p>
          </div>
          <div className={styles.footerCenter}>
            <div className={styles.footerTagline}>
              <h3>e x p l o r e<br /> p r e s e n t(s)</h3>
              <span>/</span>
              <h3>b u i l d<br /> f u t u r e s</h3>
            </div>
          </div>
          <div className={styles.footerContactCol}>
            <a className={styles.footerEmail} href={`mailto:${email}`}>{email}</a>
            {instagramUrl ? (
              <a
                href={instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.footerInstagramIcon}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7zm5 2.75A4.25 4.25 0 1 1 7.75 12 4.25 4.25 0 0 1 12 7.75zm0 2A2.25 2.25 0 1 0 14.25 12 2.25 2.25 0 0 0 12 9.75zM17.5 6a.75.75 0 1 1-.75.75A.75.75 0 0 1 17.5 6z" />
                </svg>
              </a>
            ) : null}
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>
            <Link href="/politicas-de-privacidad">
              {`Todos los derechos reservados WHAT IF ARCHITECTURE SL 2025`}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
