import { supabase } from '@/lib/supabase';

export async function uploadProjectFile(projectId: string, file: File) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) throw userErr || new Error('Not signed in');

  // Use the specific path structure: project-files/<project_id>/<filename>
  const objectPath = `${projectId}/${file.name}`;

  // 1) Upload to Storage
  const { error: upErr } = await supabase
    .storage
    .from('project-files')
    .upload(objectPath, file, { upsert: false });
  if (upErr) throw upErr;

  // 2) Insert metadata row with the same path in url field
  const { error: metaErr } = await supabase.from('project_files').insert({
    project_id: projectId,
    name: file.name,
    url: objectPath, // Store the path, not the full public URL
    size_bytes: file.size,
  });

  if (metaErr) {
    // Roll back the object if metadata insert fails
    await supabase.storage.from('project-files').remove([objectPath]);
    throw metaErr;
  }

  return objectPath;
}

export async function listProjectFiles(projectId: string) {
  const { data, error } = await supabase
    .from('project_files')
    .select('id, name, size_bytes, created_at, url')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteProjectFile(projectId: string, fileRowId: string, name: string) {
  // Delete object first
  const { error: rmErr } = await supabase.storage.from('project-files').remove([name]);
  if (rmErr) throw rmErr;

  // Delete metadata row
  const { error: delErr } = await supabase
    .from('project_files')
    .delete()
    .eq('id', fileRowId)
    .eq('project_id', projectId);
  if (delErr) throw delErr;
}