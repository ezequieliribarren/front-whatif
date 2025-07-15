import Link from 'next/link';
import styles from '../ui/work.module.css';

type Media = {
    url: string;
    alt?: string;
};

type CategoryOrType = {
    name: string;
};

type Project = {
    title: string;
    slug: string;
    date?: string;
    categories?: CategoryOrType[];
    types?: CategoryOrType[];
    imagenDestacada?: Media;
};

async function getProjects(): Promise<Project[]> {
    const res = await fetch('http://localhost:3000/api/projects', {
        cache: 'no-store',
    });
    const data = await res.json();
    return data.docs;
}

export default async function Page() {
    const projects = await getProjects();
    const backUrl = "http://localhost:3000"

    return (
        <main className={styles.container}>
            {/* Cabecera */}
            <div className={styles.row}>
                <div className={`${styles.col} ${styles.colYear}`}><h5>year</h5></div>
                <div className={`${styles.col} ${styles.colTitle}`}><h5>name</h5></div>
                <div className={`${styles.col} ${styles.colType}`}><h5>type</h5></div>
                <div className={`${styles.col} ${styles.colCategory}`}><h5>category</h5></div>
                <div className={`${styles.col} ${styles.colImg}`}></div>
            </div>

            {/* Proyectos */}
            {projects.map((proj) => (
                <div key={proj.slug} className={styles.row}>
                    <div className={`${styles.col} ${styles.colYear}`}>
                        {proj.date ? new Date(proj.date).getFullYear() : '—'}
                    </div>
                    <div className={`${styles.col} ${styles.colTitle}`}>
                        <Link href={`/work/${proj.slug}`} className={styles.titleLink}>
                            {proj.title}
                        </Link>
                    </div>
                    <div className={`${styles.col} ${styles.colType}`}>
                        {proj.types?.map((t) => t.name).join(', ') || '—'}
                    </div>
                    <div className={`${styles.col} ${styles.colCategory}`}>
                        {proj.categories?.map((c) => c.name).join(', ') || '—'}
                    </div>
                    <div
                        className={styles.colImg}
                        style={{
                            backgroundImage: `url(${backUrl+proj.imagenDestacada?.url})`,
                        }}
                    />

                </div>
            ))}
        </main>
    );
}
