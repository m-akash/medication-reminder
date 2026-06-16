using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedicineReminder.Migrations
{
    /// <inheritdoc />
    public partial class RemoveFcmTokenFromAppUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FcmToken",
                table: "AppAppUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FcmToken",
                table: "AppAppUsers",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);
        }
    }
}
