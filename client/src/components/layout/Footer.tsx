
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-dark text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm opacity-80">
            &copy; {currentYear} Tiffin Manager Admin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
