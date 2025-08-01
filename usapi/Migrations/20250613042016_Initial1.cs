﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace usapi.Migrations
{
    /// <inheritdoc />
    public partial class Initial1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Channel_TvgId",
                table: "Channels");

            migrationBuilder.AlterColumn<string>(
                name: "TvgId",
                table: "Channels",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "TvgId",
                table: "Channels",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Channel_TvgId",
                table: "Channels",
                column: "TvgId",
                unique: true);
        }
    }
}
