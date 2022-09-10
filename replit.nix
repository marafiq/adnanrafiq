{ pkgs }: {
	deps = [
		pkgs.sudo
  pkgs.nodejs-16_x
        pkgs.nodePackages.typescript-language-server
        pkgs.replitPackages.jest
	];
}