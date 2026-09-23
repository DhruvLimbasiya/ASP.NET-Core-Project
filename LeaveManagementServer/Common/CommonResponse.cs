namespace LeaveManagementServer.Common
{
    public class CommonResponse<T>
    {
        // Indicates whether request was successful
        public bool Success { get; set; }

        // Success or failure message
        public string Message { get; set; } = string.Empty;

        // Actual response data
        public T? Data { get; set; }

        // Validation or error messages
        public List<string>? Errors { get; set; }
    }
}
