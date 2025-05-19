using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sportsfeedapi.Migrations
{
    /// <inheritdoc />
    public partial class AddChannels1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StreamUrl",
                table: "Channels",
                newName: "Url");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Channels",
                newName: "ChannelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Url",
                table: "Channels",
                newName: "StreamUrl");

            migrationBuilder.RenameColumn(
                name: "ChannelId",
                table: "Channels",
                newName: "Id");
        }
    }
}
