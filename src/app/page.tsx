import Link from "next/link";
import {
  ClientSignedIn,
  ClientSignedOut,
  ClientUserButton,
} from "@/components/clerk-components";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="absolute top-4 right-4">
        <ClientSignedIn>
          <ClientUserButton />
        </ClientSignedIn>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Test Platform AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Créez des tests personnalisés avec l&apos;intelligence artificielle.
            Décrivez simplement ce que vous voulez, l&apos;IA s&apos;occupe du
            reste.
          </p>

          <ClientSignedOut>
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Connectez-vous pour commencer
              </p>
              <Link
                href="/sign-in"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </ClientSignedOut>

          <ClientSignedIn>
            <div className="space-y-4">
              <Link
                href="/create"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Créer un nouveau test
              </Link>
            </div>
          </ClientSignedIn>
        </div>
      </div>
    </div>
  );
}
