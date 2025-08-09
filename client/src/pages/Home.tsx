import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Users, Star, TrendingUp, Clock, Heart, Search, Plus, BookOpen, Award } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    { icon: BookOpen, title: "Save Social Media Recipes", desc: "Organize recipe links from Instagram, TikTok, YouTube & more in one place" },
    { icon: ChefHat, title: "Create & Share Original Recipes", desc: "Build your own recipe collection and share with the community" },
    { icon: Users, title: "Recipe Social Network", desc: "Follow chefs, discover collections, and build your culinary network" },
    { icon: Star, title: "Smart Discovery", desc: "Get personalized recommendations from both saved links and community recipes" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [features.length]);

  const stats = [
    { number: "25K+", label: "Saved Links", icon: BookOpen },
    { number: "8K+", label: "Original Recipes", icon: ChefHat },
    { number: "12K+", label: "Active Creators", icon: Users },
    { number: "45K+", label: "Community Members", icon: Star }
  ];

  const trendingRecipes = [
    { id: 1, name: "Viral TikTok Pasta", chef: "@FoodieEmma", rating: 4.8, time: "15 min", image: "🍝", difficulty: "Easy", type: "saved-link", platform: "TikTok" },
    { id: 2, name: "Grandma's Secret Cookies", chef: "BakingMaster", rating: 4.9, time: "45 min", image: "🍪", difficulty: "Medium", type: "original", platform: "Original" },
    { id: 3, name: "Instagram Smoothie Bowl", chef: "@HealthyLife", rating: 4.7, time: "10 min", image: "🥣", difficulty: "Easy", type: "saved-link", platform: "Instagram" },
    { id: 4, name: "Chef Maria's Risotto", chef: "MariaCooks", rating: 4.6, time: "35 min", image: "🍛", difficulty: "Hard", type: "original", platform: "Original" }
  ];

  const categories = [
    { name: "Instagram Reels", count: "2,850", emoji: "📸", path: "/saved-links" },
    { name: "TikTok Videos", count: "1,980", emoji: "🎵", path: "/saved-links" },
    { name: "YouTube Recipes", count: "1,750", emoji: "📺", path: "/saved-links" },
    { name: "Blog Posts", count: "950", emoji: "📝", path: "/saved-links" },
    { name: "Pinterest Pins", count: "1,400", emoji: "📌", path: "/saved-links" },
    { name: "My Recipes", count: "800", emoji: "👨‍🍳", path: "/my-recipes" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleJoinNetwork = () => {
    if (user) {
      navigate('/create-recipe');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen">{/* Background is now handled globally */}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 text-white dark:from-orange-600 dark:via-red-600 dark:to-pink-600">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 text-6xl opacity-10 animate-bounce">🍳</div>
        <div className="absolute top-40 right-40 text-4xl opacity-20 animate-pulse">👨‍🍳</div>
        <div className="absolute bottom-20 left-40 text-5xl opacity-15 animate-bounce">🥘</div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-bold mb-8 leading-tight">
              Your Recipe Social Network
              <span className="block text-yellow-300 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">
                Save • Create • Share ✨
              </span>
            </h1>
            <p className="text-xl sm:text-2xl mb-10 max-w-4xl mx-auto opacity-90 leading-relaxed">
              The ultimate recipe social network: Save links from Instagram & TikTok, create your own recipes, follow amazing chefs, and discover your next favorite dish in one vibrant community 🌟👨‍🍳
            </p>
            
            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search for recipes, ingredients, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 rounded-2xl text-gray-800 text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all border-2 border-transparent focus:border-yellow-400 bg-white/95 backdrop-blur-sm"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <button 
                    type="submit"
                    className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-2 rounded-xl hover:from-orange-500 hover:to-red-500 transition-all font-semibold"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={handleJoinNetwork}
                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 font-bold rounded-2xl hover:from-yellow-300 hover:to-orange-300 transform hover:scale-105 hover:-translate-y-1 transition-all duration-200 shadow-2xl text-lg"
              >
                <Plus className="mr-3 w-6 h-6" />
                {user ? 'Create Recipe' : 'Join Recipe Network'}
                <span className="ml-2">🌟</span>
              </button>
              <Link 
                to="/recipes"
                className="inline-flex items-center px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-gray-800 transform hover:scale-105 hover:-translate-y-1 transition-all duration-200 text-lg"
              >
                <BookOpen className="mr-3 w-6 h-6" />
                Explore Community
                <span className="ml-2">👥</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-800 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-full mb-6 shadow-lg group-hover:shadow-2xl transition-shadow">
                  <stat.icon className="w-10 h-10" />
                </div>
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-3">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400 font-semibold text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-800 dark:text-gray-200 mb-6">Complete Recipe Ecosystem 🌟</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The first social network that bridges social media recipe discovery with original recipe creation and sharing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`p-8 rounded-3xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 ${
                  currentFeature === index 
                    ? 'bg-gradient-to-br from-orange-400 to-red-400 text-white shadow-2xl scale-105' 
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-xl hover:shadow-2xl'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
                  currentFeature === index ? 'bg-white/20' : 'bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900'
                }`}>
                  <feature.icon className={`w-10 h-10 ${currentFeature === index ? 'text-white' : 'text-orange-500'}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className={`text-lg leading-relaxed ${currentFeature === index ? 'text-orange-100' : 'text-gray-600 dark:text-gray-400'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Trending Recipes */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">Trending in Community 🔥</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Mix of viral social media finds and original community creations</p>
            </div>
            <Link 
              to="/recipes"
              className="text-orange-500 hover:text-orange-600 font-bold flex items-center text-lg bg-orange-50 dark:bg-orange-900 hover:bg-orange-100 dark:hover:bg-orange-800 px-6 py-3 rounded-xl transition-all"
            >
              View All <TrendingUp className="ml-2 w-6 h-6" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white dark:bg-gray-700 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2">
                <div className="aspect-square bg-gradient-to-br from-orange-100 via-yellow-100 to-pink-100 dark:from-orange-900 dark:via-yellow-900 dark:to-pink-900 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-500 relative">
                  {recipe.image}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-8">
                  <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-gray-200">{recipe.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-base mb-4">by {recipe.chef}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span className="flex items-center bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 mr-2" />
                      {recipe.time}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                      }`}>
                        {recipe.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        recipe.type === 'original' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                      }`}>
                        {recipe.platform}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(recipe.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                      </div>
                      <span className="ml-2 font-bold text-gray-700 dark:text-gray-300">{recipe.rating}</span>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors transform hover:scale-110">
                      <Heart className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section className="py-24 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 dark:from-purple-700 dark:via-pink-700 dark:to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-10 left-10 text-9xl opacity-10">🍴</div>
        <div className="absolute bottom-10 right-10 text-7xl opacity-10">🥄</div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Save From Any Platform 🌐</h2>
            <p className="text-2xl opacity-90">Your recipe links organized by source - never lose a great recipe again!</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.path}
                className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 text-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 border border-white/20 block"
              >
                <div className="text-6xl mb-4">{category.emoji}</div>
                <h3 className="font-bold text-xl mb-2">{category.name}</h3>
                <p className="text-sm opacity-80 bg-white/20 rounded-full px-3 py-1">{category.count} recipes</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gray-900 dark:bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black dark:from-gray-950 dark:to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 text-9xl animate-pulse">🌟</div>
          <div className="absolute bottom-20 right-20 text-7xl animate-bounce">🎉</div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Award className="w-20 h-20 text-yellow-400 mx-auto mb-8 animate-pulse" />
          <h2 className="text-5xl font-bold mb-8">Ready to Share Your Culinary Journey?</h2>
          <p className="text-2xl text-gray-300 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join our community of passionate cooks and start sharing your favorite recipes today. 
            It's free, fun, and delicious! 🍽️
          </p>
          <button 
            onClick={handleJoinNetwork}
            className="inline-flex items-center px-12 py-6 bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold rounded-2xl hover:from-orange-500 hover:to-red-500 transform hover:scale-105 hover:-translate-y-2 transition-all duration-200 shadow-2xl text-xl"
          >
            <ChefHat className="mr-4 w-8 h-8" />
            {user ? 'Start Creating' : 'Join Recipe Share Now'}
            <span className="ml-2">✨</span>
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-black dark:bg-gray-950 text-white text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <ChefHat className="w-8 h-8 text-orange-400 mr-3" />
            <span className="text-2xl font-bold">Recipe Share</span>
          </div>
          <p className="text-gray-400 mb-4">Where every recipe tells a story 📖</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>© 2024 Recipe Share</span>
            <span>•</span>
            <button className="hover:text-orange-400 transition-colors">Privacy Policy</button>
            <span>•</span>
            <button className="hover:text-orange-400 transition-colors">Terms of Service</button>
            <span>•</span>
            <button className="hover:text-orange-400 transition-colors">Contact Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
