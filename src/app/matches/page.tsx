import { getMatches } from '@/app/actions/matchesActions';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import Link from 'next/link';
import { transformImageUrl } from '@/lib/util';

export default async function MatchesPage() {
  const matches = await getMatches();

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="love-gradient-bg min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-4">
            Your Matches
          </h1>
          <p className="text-white text-lg opacity-90">
            People you&apos;ve mutually matched with
          </p>
        </div>

        {matches.length === 0 ? (
          <Card className="love-card">
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">💕</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches yet</h3>
              <p className="text-gray-500 mb-6">
                Keep swiping and answering questions to find your perfect match!
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/discover"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                >
                  Start Discovering
                </Link>
                <Link
                  href="/favorites"
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                >
                  View Favorites
                </Link>
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-white text-lg">
                {matches.length} {matches.length === 1 ? 'match' : 'matches'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {matches.map((match) => (
                <Card key={match.id} className="love-card hover:shadow-xl transition-all duration-300">
                  <Link href={`/members/${match.member.userId}`}>
                    <CardBody className="p-0">
                      <div className="relative">
                        <img
                          src={transformImageUrl(match.member.image) || '/images/user.png'}
                          alt={match.member.name}
                          className="w-full h-64 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                          💕
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                          {match.member.name}, {calculateAge(match.member.dateOfBirth)}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {match.member.city}, {match.member.country}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Matched {new Date(match.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-3">
                          <Link
                            href={`/members/${match.member.userId}/chat`}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg text-center block"
                          >
                            💬 Start Chat
                          </Link>
                        </div>
                      </div>
                    </CardBody>
                  </Link>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
