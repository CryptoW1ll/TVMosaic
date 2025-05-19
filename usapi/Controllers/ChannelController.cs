using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace usapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChannelController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChannelController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Channel
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Channel>>> GetChannels()
        {
            return await _context.Channels.ToListAsync();
        }

        // GET: api/Channel with query params ?cat=News&q=abc
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Channel>>> Get([FromQuery] string? cat, [FromQuery] string? q)
        {
            var qry = _context.Channels.AsQueryable();

            if (!string.IsNullOrWhiteSpace(cat))
                qry = qry.Where(c => c.Category == cat);

            if (!string.IsNullOrWhiteSpace(q))
                qry = qry.Where(c => c.Name.Contains(q));

            return await qry.ToListAsync();
        }

        // GET: api/Channel/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Channel>> GetChannel(int id)
        {
            var channel = await _context.Channels.FindAsync(id);

            if (channel == null)
            {
                return NotFound();
            }

            return channel;
        }

        // PUT: api/Channel/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutChannel(int id, Channel channel)
        {
            if (id != channel.ChannelId)
            {
                return BadRequest();
            }

            _context.Entry(channel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChannelExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Channel
        [HttpPost]
        public async Task<ActionResult<Channel>> PostChannel(Channel channel)
        {
            _context.Channels.Add(channel);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChannel), new { id = channel.ChannelId }, channel);
        }

        // DELETE: api/Channel/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteChannel(int id)
        {
            var channel = await _context.Channels.FindAsync(id);
            if (channel == null)
            {
                return NotFound();
            }

            _context.Channels.Remove(channel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ChannelExists(int id)
        {
            return _context.Channels.Any(e => e.ChannelId == id);
        }
    }
}
