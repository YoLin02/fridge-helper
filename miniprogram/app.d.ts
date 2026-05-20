interface IAppOption {
  globalData: {
    ready: boolean;
  };
  onLaunch?: () => void;
}
