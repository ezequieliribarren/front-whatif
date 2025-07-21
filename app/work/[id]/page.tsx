import { notFound } from 'next/navigation'
import ProjectClient from '../../components/projectClient'

async function getProject(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${id}`,
    { cache: 'no-store' }
  )

  if (!res.ok) return null

  const project = await res.json()

  const photos =
    project.photos?.map((p: any) => ({
      url: p.url,
      alt: p.alt,
      width: p.width,
      height: p.height,
      mimeType: p.mimeType,
    })) || []

  const videos =
    project.videos?.map((v: any) => ({
      url: v.url,
      alt: v.alt,
      width: undefined,
      height: undefined,
      mimeType: v.mimeType,
    })) || []

  project.galeria = [...photos, ...videos]

  return project
}

export default async function ProjectPage({ params }: any) {
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  return <ProjectClient project={project} />
}
