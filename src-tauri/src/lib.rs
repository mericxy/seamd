use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct FileNode {
    name: String,
    path: String,
    relative_path: String,
    is_dir: bool,
    children: Option<Vec<FileNode>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct OpenFileResult {
    path: String,
    title: String,
    content: String,
}

#[tauri::command]
fn list_directory(path: String) -> Result<Vec<FileNode>, String> {
    let root = PathBuf::from(path);

    if !root.exists() {
        return Err("Selected folder does not exist.".into());
    }

    if !root.is_dir() {
        return Err("Selected path is not a folder.".into());
    }

    read_directory(&root, &root)
}

#[tauri::command]
fn open_markdown_file(path: String) -> Result<OpenFileResult, String> {
    let file_path = PathBuf::from(path);

    if !file_path.exists() {
        return Err("Selected file does not exist.".into());
    }

    if !file_path.is_file() {
        return Err("Selected path is not a file.".into());
    }

    if !is_markdown_file(&file_path) {
        return Err("Only Markdown files are supported in this view.".into());
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|error| format!("Failed to read Markdown file: {error}"))?;

    let title = file_path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("Untitled")
        .to_string();

    Ok(OpenFileResult {
        path: normalize_path(&file_path),
        title,
        content,
    })
}

fn read_directory(root: &Path, current: &Path) -> Result<Vec<FileNode>, String> {
    let entries = fs::read_dir(current)
        .map_err(|error| format!("Failed to read directory {}: {error}", current.display()))?;

    let mut nodes = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|error| format!("Failed to read directory entry: {error}"))?;
        let path = entry.path();
        let file_type = entry
            .file_type()
            .map_err(|error| format!("Failed to read entry type: {error}"))?;

        if file_type.is_dir() {
            let children = read_directory(root, &path)?;

            if children.is_empty() {
                continue;
            }

            nodes.push(FileNode {
                name: entry.file_name().to_string_lossy().to_string(),
                path: normalize_path(&path),
                relative_path: relative_path(root, &path),
                is_dir: true,
                children: Some(children),
            });
        } else if file_type.is_file() && is_markdown_file(&path) {
            nodes.push(FileNode {
                name: entry.file_name().to_string_lossy().to_string(),
                path: normalize_path(&path),
                relative_path: relative_path(root, &path),
                is_dir: false,
                children: None,
            });
        }
    }

    nodes.sort_by(|left, right| match (left.is_dir, right.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => left
            .name
            .to_ascii_lowercase()
            .cmp(&right.name.to_ascii_lowercase()),
    });

    Ok(nodes)
}

fn is_markdown_file(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| extension.eq_ignore_ascii_case("md"))
        .unwrap_or(false)
}

fn normalize_path(path: &Path) -> String {
    path.to_string_lossy().to_string()
}

fn relative_path(root: &Path, path: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .to_string_lossy()
        .to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![list_directory, open_markdown_file])
        .run(tauri::generate_context!())
        .expect("error while running seamd application");
}
