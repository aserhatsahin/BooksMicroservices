using Microsoft.Extensions.Logging;

namespace CORE.APP.Models;

public class CommandResponse : Response //insert update delete
{
    public bool IsSuccessful { get; }//readonly
    
    public string Message { get; }

    public CommandResponse(bool isSuccessful, string message = "", int id = 0) : base(id)
    {
        
        IsSuccessful = isSuccessful;
        Message = message;

    }
    
}