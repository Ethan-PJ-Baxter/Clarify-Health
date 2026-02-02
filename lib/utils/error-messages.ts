export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Unable to connect. Please check your internet connection.";
  }

  if (error instanceof Response || (error && typeof error === "object" && "status" in error)) {
    const status = (error as { status: number }).status;
    switch (status) {
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Something went wrong on our end. Please try again.";
      default:
        break;
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("NetworkError") || error.message.includes("network")) {
      return "Unable to connect. Please check your internet connection.";
    }
    if (error.message.includes("timeout") || error.message.includes("Timeout")) {
      return "The request timed out. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
}
