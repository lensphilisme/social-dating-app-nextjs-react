'use client';

import { useEffect, useState } from 'react';
import { getFavorites, removeFromFavorites } from '@/app/actions/favoriteActions';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import Link from 'next/link';
import { transformImageUrl } from '@/lib/util';
import { toast } from 'react-toastify';

interface Favorite {
  id: string;
  createdAt: string;
  member: {
    userId: string;
    name: string;
    dateOfBirth: string;
    city: string;
    country: string;
    image: string | null;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (targetId: string, favoriteId: string) => {
    try {
      setRemoving(favoriteId);
      const result = await removeFromFavorites(targetId);
      
      if (result.success) {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
        toast.success('Removed from favorites');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    } finally {
      setRemoving(null);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="love-gradient-bg min-h-screen p-4 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="love-gradient-bg min-h-screen p-4 pt-20 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-4">
            Your Favorites
          </h1>
          <p className="text-white text-lg opacity-90">
            People you've liked from the discover page
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card className="love-card">
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No favorites yet</h2>
              <p className="text-gray-600 mb-6">
                Start swiping on the discover page to add people to your favorites!
              </p>
              <Link 
                href="/discover"
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
              >
                Go to Discover
              </Link>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-white text-lg">
                {favorites.length} {favorites.length === 1 ? 'person' : 'people'} in your favorites
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite) => (
                <Card key={favorite.id} className="love-card hover:shadow-xl transition-all duration-300">
                  <CardBody className="p-0">
                    <div className="relative">
                      <Link href={`/members/${favorite.member.userId}`}>
                        <img
                          src={transformImageUrl(favorite.member.image) || '/images/user.png'}
                          alt={favorite.member.name}
                          className="w-full h-64 object-cover rounded-t-lg cursor-pointer"
                        />
                      </Link>
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                        ❤️
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFavorite(favorite.member.userId, favorite.id)}
                        disabled={removing === favorite.id}
                        className="absolute top-3 left-3 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-all duration-300 disabled:opacity-50"
                        title="Remove from favorites"
                      >
                        {removing === favorite.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="p-4">
                      <Link href={`/members/${favorite.member.userId}`}>
                        <h3 className="font-bold text-lg text-gray-800 mb-1 hover:text-purple-600 transition-colors cursor-pointer">
                          {favorite.member.name}, {calculateAge(favorite.member.dateOfBirth)}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-2">
                        {favorite.member.city}, {favorite.member.country}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Added {new Date(favorite.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
