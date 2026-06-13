using MedicineReminder.Account;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Volo.Abp;
using Microsoft.Extensions.Logging;

namespace MedicineReminder.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly AccountAppService _accountService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(AccountAppService accountService, ILogger<AccountController> logger)
        {
            _accountService = accountService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] Account.RegisterDto input)
        {
            try
            {
                _logger.LogInformation($"Registration attempt for email: {input.Email}");
                await _accountService.RegisterAsync(input);
                return Ok(new { success = true });
            }
            catch (BusinessException ex)
            {
                _logger.LogWarning($"Registration failed for {input.Email}: {ex.Message}");
                return BadRequest(new { success = false, error = ex.Message, details = ex.Message });
            }
            catch (System.Exception ex)
            {
                _logger.LogError($"Registration error for {input.Email}: {ex.Message}");
                return BadRequest(new { success = false, error = "Registration failed", details = ex.Message });
            }
        }
    }
}
