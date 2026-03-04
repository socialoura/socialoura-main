'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowLeft, ArrowRight, Heart, Eye } from 'lucide-react';
import useUpsellStore from '@/store/useUpsellStore';

export default function PostGrid() {
  const {
    posts,
    selectedPostsByService,
    currentDistributionService,
    selectedServices,
    togglePostSelection,
    calculateDistribution,
    prevStep,
    nextStep,
  } = useUpsellStore();

  if (!currentDistributionService) return null;

  const distribution = calculateDistribution();
  const currentServiceData = selectedServices[currentDistributionService];

  if (!currentServiceData) return null;

  const serviceLabel = currentDistributionService === 'likes' ? 'Likes' : 'Vues';
  const ServiceIcon = currentDistributionService === 'likes' ? Heart : Eye;
  const currentSelectedPosts = selectedPostsByService[currentDistributionService] || [];
  const hasSelectedPosts = currentSelectedPosts.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full pb-32">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <button
            onClick={prevStep}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-400 mb-4 transition-colors duration-200 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux services
          </button>
          
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            Où envoyer vos {serviceLabel.toLowerCase()} ?
          </h2>
          <p className="text-gray-400">
            Sélectionnez les publications sur lesquelles répartir votre commande
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-4 rounded-2xl shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <ServiceIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">À répartir</p>
            <p className="text-xl font-bold text-white tracking-tight">
              {currentServiceData.quantity.toLocaleString()} <span className="text-pink-400">{serviceLabel}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid Status Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800/50">
        <p className="text-sm font-medium text-gray-300">
          <span className="text-white font-bold">{posts.length}</span> publications disponibles
        </p>
        <AnimatePresence mode="popLayout">
          {hasSelectedPosts && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-semibold"
            >
              <CheckCircle className="w-4 h-4" />
              {currentSelectedPosts.length} sélectionnée{currentSelectedPosts.length > 1 ? 's' : ''}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {posts.map((post, index) => {
          const isSelected = currentSelectedPosts.includes(post.id);
          const dist = distribution.find((d) => d.postId === post.id);

          return (
            <motion.button
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => togglePostSelection(post.id)}
              className={`group relative aspect-[4/5] rounded-2xl overflow-hidden transition-all duration-300 ${
                isSelected
                  ? 'ring-2 ring-pink-500 ring-offset-4 ring-offset-gray-950 shadow-xl shadow-pink-500/20'
                  : 'ring-1 ring-gray-800 hover:ring-gray-600'
              }`}
            >
              <img
                src={post.imageUrl}
                alt={post.caption || `Post ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div
                className={`absolute inset-0 transition-all duration-300 ${
                  isSelected ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-100'
                }`}
              />

              {/* Stats for non-selected */}
              {!isSelected && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/80 text-xs font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likesCount}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.commentsCount}</span>
                </div>
              )}

              {/* Selected State Indicators */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/40">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isSelected && dist && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-3 left-3 right-3"
                  >
                    <div className="bg-gray-900/90 backdrop-blur-md rounded-xl py-2 px-3 text-center border border-gray-700/50 shadow-lg">
                      <span className="text-pink-400 text-sm font-black tracking-tight">
                        +{dist.amount} {serviceLabel}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Solid Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-100 border-t border-gray-800 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gray-800 items-center justify-center">
              <ServiceIcon className={`w-6 h-6 ${hasSelectedPosts ? 'text-pink-400' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-0.5">Répartition automatique</p>
              {hasSelectedPosts ? (
                <p className="text-lg font-bold text-white">
                  {Math.floor(currentServiceData.quantity / currentSelectedPosts.length).toLocaleString()} {serviceLabel} / post
                </p>
              ) : (
                <p className="text-lg font-medium text-gray-500">
                  Sélectionnez au moins 1 publication
                </p>
              )}
            </div>
          </div>

          <button
            disabled={!hasSelectedPosts}
            onClick={() => hasSelectedPosts && nextStep()}
            className="w-full sm:w-auto relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 uppercase tracking-wide group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="relative z-10">Valider la sélection</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
