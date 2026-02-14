import {
  FileImage,
  FileText,
  FileArchive,
  FileAudio,
  FileVideo,
  FileCode,
  File,
  Download,
} from "lucide-react";

interface FileIconProps {
  filename: string;
  className?: string;
}

const extensionMap: Record<string, { icon: typeof File; color: string }> = {
  // Images
  jpg: { icon: FileImage, color: "text-pink-500" },
  jpeg: { icon: FileImage, color: "text-pink-500" },
  png: { icon: FileImage, color: "text-pink-500" },
  gif: { icon: FileImage, color: "text-pink-500" },
  webp: { icon: FileImage, color: "text-pink-500" },
  svg: { icon: FileImage, color: "text-pink-500" },
  // Documents
  pdf: { icon: FileText, color: "text-red-500" },
  doc: { icon: FileText, color: "text-blue-500" },
  docx: { icon: FileText, color: "text-blue-500" },
  txt: { icon: FileText, color: "text-gray-500" },
  xls: { icon: FileText, color: "text-green-500" },
  xlsx: { icon: FileText, color: "text-green-500" },
  // Archives
  zip: { icon: FileArchive, color: "text-yellow-500" },
  rar: { icon: FileArchive, color: "text-yellow-500" },
  "7z": { icon: FileArchive, color: "text-yellow-500" },
  tar: { icon: FileArchive, color: "text-yellow-500" },
  gz: { icon: FileArchive, color: "text-yellow-500" },
  // Audio
  mp3: { icon: FileAudio, color: "text-purple-500" },
  wav: { icon: FileAudio, color: "text-purple-500" },
  flac: { icon: FileAudio, color: "text-purple-500" },
  // Video
  mp4: { icon: FileVideo, color: "text-indigo-500" },
  mkv: { icon: FileVideo, color: "text-indigo-500" },
  avi: { icon: FileVideo, color: "text-indigo-500" },
  mov: { icon: FileVideo, color: "text-indigo-500" },
  // Code
  js: { icon: FileCode, color: "text-yellow-400" },
  ts: { icon: FileCode, color: "text-blue-400" },
  py: { icon: FileCode, color: "text-green-400" },
  rs: { icon: FileCode, color: "text-orange-400" },
  // Installers
  exe: { icon: Download, color: "text-cyan-500" },
  msi: { icon: Download, color: "text-cyan-500" },
  dmg: { icon: Download, color: "text-cyan-500" },
};

export function FileIcon({ filename, className = "w-5 h-5" }: FileIconProps) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const { icon: Icon, color } = extensionMap[ext] || {
    icon: File,
    color: "text-gray-400",
  };

  return <Icon className={`${className} ${color}`} />;
}
