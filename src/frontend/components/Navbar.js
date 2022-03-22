import { Navbar, Nav, Button, Container } from "react-bootstrap";
import market from "./tr7-logo-001.png";
import { Link } from "react-router-dom";
import { HomePageSlag } from "./Home";

const Navigation = ({ web3Handler, account }) => {
  return (
    <Navbar expand="lg" bg="secondary" variant="dark">
      <Container>
        <Navbar.Brand href="https://tr7-crypto.github.io/tr7-nft-marketplace/">
          <img src={market} width="40" height="40" className="" alt="" />
          &nbsp;TR7 NFT Marketplace
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Button className="mx-1" variant="">
              <Nav.Link as={Link} to={`${HomePageSlag}/`}>
                Market
              </Nav.Link>
            </Button>
            {"  "}
            <Button className="mx-1" variant="">
              <Nav.Link as={Link} to={`${HomePageSlag}/create`}>
                Mint NFT
              </Nav.Link>
            </Button>
            {"  "}
            <Button className="mx-1" variant="">
              <Nav.Link as={Link} to={`${HomePageSlag}/my-listed-items`}>
                Your Listed NFTs
              </Nav.Link>
            </Button>
            {"  "}
            <Button className="mx-1" variant="">
              <Nav.Link as={Link} to={`${HomePageSlag}/my-purchases`}>
                Your Purchased NFTs
              </Nav.Link>
            </Button>
          </Nav>
          <Nav>
            {account ? (
              <Nav.Link
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button nav-button btn-sm mx-4"
              >
                <Button variant="outline-light">
                  {account.slice(0, 5) + "..." + account.slice(38, 42)}
                </Button>
              </Nav.Link>
            ) : (
              <Button onClick={web3Handler} variant="outline-light">
                Connect Wallet
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
