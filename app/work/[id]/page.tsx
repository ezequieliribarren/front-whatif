import { notFound } from 'next/navigation'
import ProjectClient from '../../components/projectClient'

const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || ''

const normalizeProject = (project: any) => {
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

  return { ...project, galeria: [...photos, ...videos] }
}

async function fetchProjectByField(field: 'slug' | 'title', value: string) {
  if (!backendBase) return null

  const searchParams = new URLSearchParams()
  searchParams.set(`where[${field}][equals]`, value)
  searchParams.set('limit', '1')
  searchParams.set('locale', 'all')
  searchParams.set('depth', '2')

  const res = await fetch(`${backendBase}/api/projects?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null

  const data = await res.json()
  const project =
    Array.isArray(data?.docs) && data.docs.length > 0 ? data.docs[0] : null

  return project ? normalizeProject(project) : null
}

async function fetchProjectById(id: string) {
  if (!backendBase) return null

  const res = await fetch(`${backendBase}/api/projects/${id}?locale=all&depth=2`, {
    cache: 'no-store',
  })
  if (!res.ok) return null

  const project = await res.json()
  return normalizeProject(project)
}

async function getProject(identifier: string) {
  const bySlug = await fetchProjectByField('slug', identifier)
  if (bySlug) return bySlug

  const byTitle = await fetchProjectByField('title', identifier)
  if (byTitle) return byTitle

  const byId = await fetchProjectById(identifier)
  if (byId) return byId

  return null
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolved = await params
  const identifier = decodeURIComponent(resolved.id || '')
  const project = await getProject(identifier)

  if (!project) {
    notFound()
  }

  return <ProjectClient project={project} />
}
