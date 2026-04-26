import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { r2ListFolders, r2ListFiles } from "@/lib/r2";
import { Check, X, Folder, FileIcon, RefreshCw, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function checkR2Connection() {
  try {
    const folders = await r2ListFolders();
    return {
      connected: true,
      folders: folders.length,
      error: null,
    };
  } catch (error: any) {
    return {
      connected: false,
      folders: 0,
      error: error.message || "Unknown error",
    };
  }
}

export default async function R2AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ bucket?: string; folder?: string }>;
}) {
  const user = await requireAuth();
  
  // Only admins can access this page
  if (user.role !== "platform_admin") {
    redirect("/dashboard");
  }

  const { bucket, folder } = await searchParams;

  // Check R2 connection
  const connectionStatus = await checkR2Connection();
  
  // Get folders and files
  let folders: string[] = [];
  let files: Array<{ key: string; size: number; lastModified?: Date }> = [];
  
  if (connectionStatus.connected && bucket) {
    if (folder) {
      files = await r2ListFiles(folder);
    } else {
      folders = await r2ListFolders();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">R2 Storage Manager</h1>
              <p className="text-slate-600 mt-2">
                {!bucket 
                  ? "Select a storage bucket to manage" 
                  : "Manage and browse your Cloudflare R2 media assets"}
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Connection Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className={`mt-1 rounded-full p-2 ${
              connectionStatus.connected 
                ? "bg-green-100" 
                : "bg-red-100"
            }`}>
              {connectionStatus.connected ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Connection Status
              </h2>
              {connectionStatus.connected ? (
                <div>
                  <p className="text-green-600 font-medium">Connected to R2</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Found {connectionStatus.folders} top-level folders
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Account ID:</span>
                      <p className="font-mono text-slate-900">{process.env.R2_ACCOUNT_ID}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Bucket:</span>
                      <p className="font-mono text-slate-900">{process.env.R2_BUCKET}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-red-600 font-medium">Connection Failed</p>
                  <p className="text-sm text-slate-600 mt-1">{connectionStatus.error}</p>
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">
                      Make sure your R2 credentials are correctly configured in your .env file.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <form>
              <button
                type="submit"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </button>
            </form>
          </div>
        </div>

        {/* Breadcrumb */}
        {bucket && (
          <div className="mb-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/admin/r2"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Buckets
              </Link>
              <span className="text-slate-400">/</span>
              <Link
                href={`/admin/r2?bucket=seerah`}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Seerah Media
              </Link>
              {folder && (
                <>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-900 font-medium">{folder.replace(/\/$/, "")}</span>
                </>
              )}
            </nav>
          </div>
        )}

        {/* Bucket Selection or Browser */}
        {!bucket ? (
          /* Bucket Selection */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-900">Available Storage Buckets</h2>
            </div>
            
            <div className="p-6">
              <Link
                href="/admin/r2?bucket=seerah"
                className="group block p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Folder className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Seerah R2 Storage
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Main storage bucket for all Seerah course media assets
                    </p>
                    {connectionStatus.connected && (
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Connected
                        </span>
                        <span>Bucket: {process.env.R2_BUCKET}</span>
                        <span>{connectionStatus.folders} folders</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                </div>
              </Link>
            </div>
          </div>
        ) : connectionStatus.connected ? (
          /* File Browser */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-900">
                {folder ? `Files in ${folder}` : "Folders"}
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {/* Back button when in folder */}
              {folder && (
                <Link
                  href="/admin/r2?bucket=seerah"
                  className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <Folder className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-600">..</span>
                </Link>
              )}

              {/* Folders */}
              {!folder && folders.length > 0 && folders.map((folderName) => (
                <Link
                  key={folderName}
                  href={`/admin/r2?bucket=seerah&folder=${encodeURIComponent(folderName)}`}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <Folder className="w-5 h-5 text-blue-500" />
                  <span className="text-slate-900 font-medium group-hover:text-blue-600">
                    {folderName.replace(/\/$/, "")}
                  </span>
                </Link>
              ))}

              {/* Files */}
              {folder && files.length > 0 && files.map((file) => (
                <div
                  key={file.key}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-slate-900 font-medium truncate">
                        {file.key.split("/").pop()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                        {file.lastModified && (
                          <> · {new Date(file.lastModified).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/r2/asset?key=${encodeURIComponent(file.key)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                  >
                    View
                  </a>
                </div>
              ))}

              {/* Empty state */}
              {((folder && files.length === 0) || (!folder && folders.length === 0)) && (
                <div className="px-6 py-12 text-center">
                  <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">
                    {folder ? "No files found in this folder" : "No folders found"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Expected Folder Structure */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Expected R2 Folder Structure</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              "videos/",
              "audio/",
              "mindmaps/",
              "reports/",
              "slides-presented/",
              "slides-detailed/",
              "slides-facts/",
              "flashcards/",
              "quizzes/",
              "statement-of-facts/",
              "studyguides/",
              "infographics/",
              "briefing/",
            ].map((folder) => (
              <div key={folder} className="flex items-center gap-2 text-blue-700">
                <Folder className="w-4 h-4" />
                <span className="font-mono">{folder}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-4">
            Make sure your R2 bucket follows this structure for the website to work correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
