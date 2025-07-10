import { Button, Toast } from '@paykit-sdk/ui';

export function ToastDemo() {
  const handleSuccessToast = () => {
    Toast.success('Success!', 'Your action was completed successfully');
  };

  const handleErrorToast = () => {
    Toast.error('Error!', 'Something went wrong with your request');
  };

  const handleWarningToast = () => {
    Toast.warning('Warning!', 'Please check your input before proceeding');
  };

  const handleInfoToast = () => {
    Toast.info('Info', 'Here\'s some helpful information for you');
  };

  const handleLoadingToast = () => {
    Toast.loading('Loading...', 'Please wait while we process your request');
  };

  const handlePromiseToast = () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve('Success!') : reject('Failed!');
      }, 2000);
    });

    Toast.promise(promise, {
      loading: 'Processing your request...',
      success: 'Request completed successfully!',
      error: 'Request failed. Please try again.',
    });
  };

  const handleCustomToast = () => {
    Toast.custom(
      <div className="flex items-center gap-2">
        <div className="size-2 bg-primary rounded-full animate-pulse"></div>
        <span>Custom toast with JSX content!</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleSuccessToast}>Success Toast</Button>
        <Button onClick={handleErrorToast}>Error Toast</Button>
        <Button onClick={handleWarningToast}>Warning Toast</Button>
        <Button onClick={handleInfoToast}>Info Toast</Button>
        <Button onClick={handleLoadingToast}>Loading Toast</Button>
        <Button onClick={handlePromiseToast}>Promise Toast</Button>
        <Button onClick={handleCustomToast}>Custom Toast</Button>
        <Button onClick={() => Toast.dismiss()}>Dismiss All</Button>
      </div>
    </div>
  );
} 