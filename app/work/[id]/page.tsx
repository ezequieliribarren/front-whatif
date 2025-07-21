import { notFound } from 'next/navigation'
import ProjectClient from '../../components/projectClient'

type Params = {
  id: string
}

interface PageProps {
  params: Params
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = params

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${id}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    notFound()
  }

  const project = await res.json()

  // Unificar galería con fotos y videos
  const photos = project.photos?.map((p: any) => ({
    url: p.url,
    alt: p.alt,
    width: p.width,
    height: p.height,
    mimeType: p.mimeType,
  })) || []

  const videos = project.videos?.map((v: any) => ({
    url: v.url,
    alt: v.alt,
    width: undefined,
    height: undefined,
    mimeType: v.mimeType,
  })) || []

  project.galeria = [...photos, ...videos]

  return <ProjectClient project={project} />
}
