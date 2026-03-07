import { create } from 'zustand';

export type TiktokServiceType = 'followers' | 'likes' | 'views';
export type TiktokDistributableService = 'likes' | 'views';

const DISTRIBUTABLE_ORDER: TiktokDistributableService[] = ['likes', 'views'];

interface ServiceSelection {
  type: TiktokServiceType | 'shares';
  quantity: number;
  price: number;
}

export interface TiktokPost {
  id: string;
  shortCode: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  isVideo: boolean;
}

interface TiktokUpsellState {
  // Step 1: Profile
  username: string;
  avatarUrl: string;
  fullName: string;
  followersCount: number;
  posts: TiktokPost[];
  isProfileLoading: boolean;
  profileError: string | null;

  // Step 2: Service (multiple services support)
  selectedServices: Record<string, ServiceSelection>;
  selectedService: TiktokServiceType | null;
  quantity: number;
  price: number;
  sliderDefaults: Record<string, number>;

  // Step 3: Post selection (per service)
  selectedPostsByService: Record<string, string[]>;
  currentDistributionService: TiktokDistributableService | null;
  distributionQueue: TiktokDistributableService[];
  distributionIndex: number;
  selectedPostIds: string[];

  // Step 4: Checkout
  email: string;
  acceptedTerms: boolean;

  // Current step
  currentStep: number;

  // Actions
  setUsername: (username: string) => void;
  setProfile: (data: { avatarUrl: string; fullName: string; followersCount: number; posts: TiktokPost[] }) => void;
  setProfileLoading: (loading: boolean) => void;
  setProfileError: (error: string | null) => void;
  setSelectedService: (service: TiktokServiceType) => void;
  setQuantity: (quantity: number) => void;
  setPrice: (price: number) => void;
  setSliderDefaults: (defaults: Record<string, number>) => void;
  addServiceToCart: (serviceType: string, quantity: number, price: number) => void;
  removeServiceFromCart: (serviceType: string) => void;
  togglePostSelection: (postId: string) => void;
  setCurrentDistributionService: (service: TiktokDistributableService | null) => void;
  getDistributableServices: () => { type: TiktokDistributableService; quantity: number }[];
  moveToNextDistributableService: () => boolean;
  setEmail: (email: string) => void;
  setAcceptedTerms: (accepted: boolean) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetProfile: () => void;
  resetAll: () => void;

  // Computed
  calculateDistribution: () => { postId: string; amount: number }[];
  isDistributable: () => boolean;
}

const useTiktokUpsellStore = create<TiktokUpsellState>((set, get) => ({
  username: '',
  avatarUrl: '',
  fullName: '',
  followersCount: 0,
  posts: [],
  isProfileLoading: false,
  profileError: null,
  selectedServices: {},
  selectedService: null,
  quantity: 100,
  price: 2.49,
  sliderDefaults: {
    followers: 1,
    likes: 1,
    views: 0,
    shares: 0,
  },
  selectedPostsByService: {},
  currentDistributionService: null,
  distributionQueue: [],
  distributionIndex: 0,
  selectedPostIds: [],
  email: '',
  acceptedTerms: false,
  currentStep: 0,

  setUsername: (username) => set({ username }),
  setProfile: (data) => set({
    avatarUrl: data.avatarUrl,
    fullName: data.fullName,
    followersCount: data.followersCount,
    posts: data.posts,
    currentStep: 1,
    profileError: null,
  }),
  setProfileLoading: (loading) => set({ isProfileLoading: loading }),
  setProfileError: (error) => set({ profileError: error }),
  setSelectedService: (service) => set({ selectedService: service, selectedPostIds: [] }),
  setQuantity: (quantity) => set({ quantity }),
  setPrice: (price) => set({ price }),
  setSliderDefaults: (defaults) => set({ sliderDefaults: defaults }),

  addServiceToCart: (serviceType, quantity, price) => set((state) => ({
    selectedServices: {
      ...state.selectedServices,
      [serviceType]: { type: serviceType as TiktokServiceType, quantity, price },
    },
  })),

  removeServiceFromCart: (serviceType) => set((state) => {
    const newServices = { ...state.selectedServices };
    delete newServices[serviceType];
    return { selectedServices: newServices };
  }),

  togglePostSelection: (postId) => set((state) => {
    const { currentDistributionService } = state;
    if (!currentDistributionService) {
      const exists = state.selectedPostIds.includes(postId);
      return {
        selectedPostIds: exists
          ? state.selectedPostIds.filter((id) => id !== postId)
          : [...state.selectedPostIds, postId],
      };
    }

    const currentPosts = state.selectedPostsByService[currentDistributionService] || [];
    const exists = currentPosts.includes(postId);

    return {
      selectedPostsByService: {
        ...state.selectedPostsByService,
        [currentDistributionService]: exists
          ? currentPosts.filter((id) => id !== postId)
          : [...currentPosts, postId],
      },
    };
  }),

  setCurrentDistributionService: (service) => set({ currentDistributionService: service }),

  getDistributableServices: () => {
    const { selectedServices } = get();
    return DISTRIBUTABLE_ORDER
      .filter((type) => selectedServices[type])
      .map((type) => ({ type, quantity: selectedServices[type].quantity }));
  },

  moveToNextDistributableService: () => {
    const { distributionQueue, distributionIndex } = get();
    if (distributionQueue.length === 0) return false;
    const nextIndex = distributionIndex + 1;
    if (nextIndex < distributionQueue.length) {
      set({
        currentDistributionService: distributionQueue[nextIndex],
        distributionIndex: nextIndex,
      });
      return true;
    }
    return false;
  },

  setEmail: (email) => set({ email }),
  setAcceptedTerms: (accepted) => set({ acceptedTerms: accepted }),
  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep === 1) {
      const distributableServices = get().getDistributableServices();
      const queue = distributableServices.map((s) => s.type);
      if (queue.length === 0) {
        set({ currentStep: 3 });
      } else {
        set({
          distributionQueue: queue,
          distributionIndex: 0,
          currentDistributionService: queue[0],
          currentStep: 2,
        });
      }
    } else if (currentStep === 2) {
      const hasNext = get().moveToNextDistributableService();
      if (!hasNext) {
        set({ currentStep: 3 });
      }
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  resetProfile: () => set({
    username: '', avatarUrl: '', fullName: '', followersCount: 0, posts: [],
    selectedServices: {}, selectedService: null, quantity: 100, price: 2.49,
    selectedPostsByService: {}, currentDistributionService: null,
    distributionQueue: [], distributionIndex: 0, selectedPostIds: [],
    currentStep: 0, profileError: null,
  }),

  resetAll: () => set({
    username: '', avatarUrl: '', fullName: '', followersCount: 0, posts: [],
    isProfileLoading: false, profileError: null, selectedServices: {},
    selectedService: null, quantity: 100, price: 2.49, selectedPostsByService: {},
    currentDistributionService: null, distributionQueue: [], distributionIndex: 0,
    selectedPostIds: [], email: '', acceptedTerms: false, currentStep: 0,
  }),

  calculateDistribution: () => {
    const { currentDistributionService, selectedPostsByService, selectedServices } = get();
    if (!currentDistributionService) {
      const { selectedPostIds, quantity } = get();
      if (selectedPostIds.length === 0) return [];
      const base = Math.floor(quantity / selectedPostIds.length);
      const remainder = quantity % selectedPostIds.length;
      return selectedPostIds.map((postId, index) => ({
        postId, amount: base + (index < remainder ? 1 : 0),
      }));
    }
    const selectedPosts = selectedPostsByService[currentDistributionService] || [];
    const serviceData = selectedServices[currentDistributionService];
    if (!serviceData || selectedPosts.length === 0) return [];
    const quantity = serviceData.quantity;
    const base = Math.floor(quantity / selectedPosts.length);
    const remainder = quantity % selectedPosts.length;
    return selectedPosts.map((postId, index) => ({
      postId, amount: base + (index < remainder ? 1 : 0),
    }));
  },

  isDistributable: () => {
    const { selectedService } = get();
    return selectedService === 'likes' || selectedService === 'views';
  },
}));

export default useTiktokUpsellStore;
